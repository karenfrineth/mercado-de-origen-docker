# Tienda · API de e-commerce

Proyecto académico de Backend con PHP y Laravel, KODIGO Academy. Una persona puede registrarse, consultar el catálogo, crear una orden en USD, iniciar un pago con Stripe y revisar su historial. Un administrador puede crear, modificar y retirar productos.

## Instalación

Se requiere PHP 8.2 o superior con las extensiones de Laravel, PDO MySQL, curl y mbstring, Composer 2 y MySQL 8. Se recomienda una base vacía dedicada a la aplicación. El servidor web debe servir únicamente el directorio `public/`.

1. Clonar el repositorio, abrir una terminal en la carpeta de `artisan` e instalar dependencias:

   ```bash
   composer install
   php -r "if (!file_exists('.env')) copy('.env.example', '.env');"
   php artisan key:generate
   php artisan tienda:jwt-key
   ```

2. Crear la base de datos en MySQL y conceder a un usuario propio de la aplicación acceso a esa base. Ajustar `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` y `DB_PASSWORD` en `.env`. Ejemplo para crear la base:

   ```sql
   CREATE DATABASE tienda CHARACTER SET utf8mb4;
   ```

3. Para probar pagos, configurar en `.env` la clave secreta de prueba de Stripe (`STRIPE_SECRET`) y el secreto de firma del endpoint (`STRIPE_WEBHOOK_SECRET`). El registro, catálogo y órdenes se pueden probar antes de configurar Stripe. Si se cambia la configuración después de cachearla, ejecutar `php artisan config:clear`.
4. Migrar, cargar los tres productos de ejemplo y arrancar:

   ```bash
   php artisan migrate --seed
   php artisan serve
   ```

5. Abrir **http://127.0.0.1:8000/api/documentation**. La interfaz Swagger UI y el contrato OpenAPI 3.0.3 se sirven desde el proyecto. El contrato también está en `public/openapi.json`. Para desplegar, definir `APP_URL` con el origen HTTPS de la API, `APP_ENV=production` y `APP_DEBUG=false`.

## Probar una compra desde Swagger

1. En **Clientes**, ejecutar `POST /register` con nombre, correo y una contraseña de al menos 12 caracteres. Ejecutar `POST /login` con el mismo correo y contraseña. Copiar solo el valor de `access_token` en **Authorize → bearerJWT**. El token dura una hora.
2. En **Catálogo**, consultar `GET /products` y copiar un ID. Para gestionar el catálogo con una cuenta ya registrada, un operador del servidor debe ejecutar `php artisan tienda:admin usuario@example.org` con el correo correspondiente.
3. En **Compras**, crear la orden con `POST /orders`. La referencia es un UUID elegido por el cliente. Usar una referencia nueva para cada compra. Ejemplo:

   ```json
   {
     "reference": "fb37558c-8fe4-426f-885c-5bb810d76b0d",
     "items": [{"product_id": 1, "quantity": 2}]
   }
   ```

   Con los datos iniciales, dos bolsas de café de 950 centavos producen una orden de **1.900 centavos (USD 19,00)**. Repetir la misma referencia y cantidades recupera la orden. Cambiar las líneas de esa referencia devuelve 409.
4. Con Stripe en modo prueba, abrir otra terminal y ejecutar `stripe listen --events payment_intent.succeeded --forward-to http://127.0.0.1:8000/api/stripe/webhook` mediante Stripe CLI autenticada en la misma cuenta. Copiar el secreto de firma que muestra la CLI a `STRIPE_WEBHOOK_SECRET` y recargar la configuración.
5. Ejecutar `POST /orders/{id}/payment`. El SDK oficial crea o recupera el PaymentIntent vinculado a esa orden. Una app cliente puede confirmar con Stripe.js usando el `client_secret`. Para una prueba manual desde Stripe CLI, sustituir el ID por el devuelto:

   ```bash
   stripe payment_intents confirm pi_ID_DEVUELTO --payment-method=pm_card_visa
   ```

6. Consultar `GET /orders/{id}` después de que el webhook llegue. El estado pasa de `pending` a `paid` únicamente al conciliar el evento de éxito. El historial completo del cliente está en `GET /orders`.

## Endpoints

Todos los caminos de la tabla llevan el prefijo `/api`. Swagger detalla cuerpos de entrada y salida, estados HTTP y esquemas de error.

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| POST | /register | Público | Registrar cliente |
| POST | /login | Público | Emitir JWT |
| GET | /products | Público | Listar catálogo |
| GET | /products/{product} | Público | Consultar producto |
| POST | /products | Administrador | Crear producto |
| PATCH | /products/{product} | Administrador | Actualizar campos |
| DELETE | /products/{product} | Administrador | Retirar producto |
| POST | /orders | Cliente | Crear orden o recuperar un reintento |
| GET | /orders | Cliente | Ver historial propio |
| GET | /orders/{id} | Titular | Ver orden con líneas |
| POST | /orders/{id}/payment | Titular | Obtener intento de pago |
| POST | /stripe/webhook | Firma de Stripe | Conciliar pago confirmado |

## Diseño y validaciones

- **Autenticación.** Hash de contraseña de Laravel y JWT HS256 con clave independiente, firma, emisor, audiencia y caducidad. El permiso administrativo se lee de MySQL en cada petición. El registro público nunca concede ese permiso.
- **Validación.** Las Form Requests validan registro, login, productos y órdenes. Los propietarios se comprueban antes de mostrar una compra o iniciar el pago. La API devuelve errores con `error.status`, `error.message` y `error.details`.
- **Importes.** Todos los precios se calculan en centavos enteros en el servidor. El catálogo aplica borrado lógico. Las líneas conservan nombre y precio al comprar.
- **Transacciones.** La creación de la orden y sus líneas es atómica. El bloqueo por cliente y la restricción única de usuario y referencia evitan duplicados por reintentos simultáneos.
- **Pagos.** Cada orden tiene un registro de pago y una clave de idempotencia estable para Stripe. Se recupera el mismo intento al reintentar. Si quedó indeterminado durante más de 23 horas y falta el ID externo, el servicio solicita conciliación manual antes de crear otro. La firma del webhook se verifica sobre el cuerpo original. Al confirmar se contrastan orden, moneda, intento e importe recibido. Los eventos repetidos conservan el estado final.
- **Persistencia.** `users → orders → order_items`; cada línea referencia un `product` y una orden tiene como máximo un `payment`. Las migraciones y el seeder están en `database/`. Toda credencial real se configura fuera del repositorio.

## Verificación realizada

En PHP 8.4 y MySQL 8.0 se ejecutaron las migraciones y el seeder, las doce operaciones HTTP, los controles de titularidad y rol, la repetición de la orden y del intento de pago, y el rechazo de una firma inválida. El ensayo del proveedor utilizó el SDK real con una respuesta simulada y eventos firmados localmente. La prueba de extremo a extremo en la cuenta Stripe del usuario requiere sus claves de prueba y el procedimiento de arriba.

Documentación de referencia: [Laravel Form Requests](https://laravel.com/docs/12.x/validation#form-request-validation), [Stripe PaymentIntents](https://docs.stripe.com/payments/payment-intents) y [webhooks de Stripe](https://docs.stripe.com/webhooks).
