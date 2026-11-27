<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
final class OrderItem extends Model
{
    public $timestamps = false;
    protected $fillable = ['product_id','name','unit_cents','quantity'];
}
