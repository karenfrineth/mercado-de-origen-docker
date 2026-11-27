# Mercado de origen · Ecosistema Docker

Catálogo y compra de productos salvadoreños. Esta entrega reúne el [frontend Next.js del módulo 4](https://github.com/karenfrineth/mercado-de-origen-next) y la [API Laravel del módulo 3](https://github.com/karenfrineth/tienda-api-laravel) en un proyecto de Docker Compose.

## Arquitectura

| Servicio | Responsabilidad | Conexiones |
|---|---|---|
| frontend | Next.js 16, App Router, catálogo, carrito y sesión | El navegador entra por localhost:3000. Los componentes y acciones de servidor consultan http://backend:8000/api por la red web. |
| backend | Nginx sirve archivos públicos y pasa las peticiones de Laravel a PHP-FPM por 127.0.0.1:9000 dentro del contenedor | Nginx escucha en 8000. Laravel accede a MySQL por la red datos. El puerto 8000 del host permite consultar Swagger y reenviar webhooks de prueba. |
| mysql | MySQL 8.0 almacena clientes, productos, órdenes y pagos | Solo acepta tráfico de la red interna datos por 3306. El volumen mysql_data conserva los datos al recrear los contenedores. |

## Primera ejecución

Requisitos: Docker con BuildKit, Docker Compose v2 y Python 3 para generar las claves locales. Ejecuta los comandos desde la raíz del repositorio.

~~~sh
python3 scripts/preparar.py
docker compose up --build -d
~~~

El primer comando crea un archivo local .env a partir de .env.example con claves y contraseñas aleatorias. Si ya existe, lo conserva. Compose inicia MySQL, espera a que responda a una consulta autenticada e inicia Laravel. Laravel aplica las migraciones pendientes. Una migración carga el catálogo de ejemplo una sola vez. Cuando la API responde, se inicia Next.js.

- Catálogo: http://localhost:3000
- Swagger UI: http://localhost:8000/api/documentation
- Productos en JSON: http://localhost:8000/api/products

En Codespaces abre los puertos 3000 y 8000 desde la pestaña Ports. Para iniciar sesión desde la URL reenviada, define APP_ORIGIN con el origen HTTPS exacto del puerto 3000, API_ORIGIN con el del puerto 8000 y COOKIE_SECURE=true, y vuelve a ejecutar docker compose up -d. En un servidor público, coloca un proxy HTTPS delante de los puertos locales. En el navegador, el carrito persiste localmente y el token de sesión se guarda en una cookie HttpOnly.

## Comprobación

~~~sh
docker compose ps
curl -fsS http://localhost:8000/api/products
curl -fsS http://localhost:8000/api/documentation > /dev/null
curl -fsS http://localhost:3000/ | grep -o 'Apaneca' | head -1
docker compose exec backend php artisan migrate:status
docker compose images
~~~

La respuesta de productos debe incluir Café de Apaneca, Taza de barro y Chocolate de mesa. El catálogo debe mostrar esos productos. Para diagnosticar un fallo usa docker compose logs --tail=100 backend mysql frontend. Para detener el entorno usa docker compose down. Para volver a iniciarlo usa docker compose up -d. El volumen se reutiliza.

## Configuración de pagos

Para probar pagos con Stripe, introduce claves de la misma cuenta en modo de prueba. STRIPE_SECRET y STRIPE_WEBHOOK_SECRET corresponden a Laravel. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY es pública y se incorpora al frontend al compilar. Usa Stripe CLI con stripe listen --forward-to localhost:8000/api/stripe/webhook y copia el secreto de firma de ese listener en .env. Después de ajustar las claves ejecuta docker compose up --build -d. Sin configurar Stripe puedes explorar productos, registrarte e iniciar sesión. Consulta los README de backend y frontend para el recorrido de compra. Conserva .env fuera de Git.

## Decisiones sobre las imágenes

**Frontend.** Node 22 Alpine satisface los requisitos de Next.js 16. La primera etapa de dependencias copia los manifiestos y usa npm ci con el lockfile. Cambiar un componente reutiliza esa capa. La etapa de compilación conserva una caché de BuildKit para Next y elimina las dependencias de desarrollo después del build. La etapa final arranca next start como el usuario node y recibe solo package.json, dependencias de producción, public y el resultado .next. La caché de compilación queda en el montaje de BuildKit.

**Backend.** La base PHP 8.2 FPM Alpine añade pdo_mysql y OPcache y comprueba las extensiones de la aplicación. Composer instala desde composer.lock en una etapa aparte, sin paquetes de desarrollo. El autoloader optimizado se genera después de copiar las clases. De esa etapa se copia únicamente vendor al runtime. La imagen final incorpora el código necesario, Nginx y un proceso de inicio supervisado por tini. PHP-FPM y Nginx corren como www-data. Si termina uno, se detiene el otro. Nginx limita el acceso web al directorio public. Los secretos llegan al arrancar el contenedor.

**Base de datos.** El Dockerfile hereda directamente de mysql:8.0. La distribución oficial ya incluye servidor y lógica de inicialización. El volumen se monta en /var/lib/mysql. Las contraseñas iniciales se aplican al crear un volumen vacío. Conserva el .env asociado al volumen.

Los archivos .dockerignore excluyen dependencias locales, credenciales y documentación del contexto de las aplicaciones. Los lockfiles fijan dependencias de npm y Composer. Las etiquetas base permiten recibir revisiones de mantenimiento; para reconstruir exactamente una entrega publicada, registra también los digests de las imágenes base.
