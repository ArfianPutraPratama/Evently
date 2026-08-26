<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'category',
        'location',
        'event_date',
        'end_date',
        'quota',
        'registered_count',
        'banner_url',
        'speaker_name',
        'speaker_role',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'end_date' => 'datetime',
            'quota' => 'integer',
            'registered_count' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    protected $appends = [
        'remaining_quota',
        'is_sold_out',
    ];

    public function getRemainingQuotaAttribute(): int
    {
        return max(0, $this->quota - $this->registered_count);
    }

    public function getIsSoldOutAttribute(): bool
    {
        return $this->registered_count >= $this->quota;
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function tickets(): HasManyThrough
    {
        return $this->hasManyThrough(Ticket::class, Registration::class);
    }

    protected static function booted()
    {
        static::creating(function ($event) {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title) . '-' . Str::lower(Str::random(6));
            }
        });
    }
}
