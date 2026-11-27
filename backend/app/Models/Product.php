<?php
namespace App\Models;
use Illuminate\Database\Eloquent\{Model, SoftDeletes};

final class Product extends Model
{
    use SoftDeletes;
    protected $fillable = ['name','description','price_cents'];
    protected $hidden = ['deleted_at'];
}
