<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Product;

final class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([['Café de Apaneca','Café tostado, bolsa de 340 g.',950],
                  ['Taza de barro','Pieza artesanal de cerámica.',1250],
                  ['Chocolate de mesa','Tabletas de cacao, paquete de 200 g.',600]] as [$name,$description,$price]) {
            Product::firstOrCreate(['name'=>$name], ['description'=>$description,'price_cents'=>$price]);
        }
    }
}
