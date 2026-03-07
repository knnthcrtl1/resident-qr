<?php

namespace App\Filament\Resources\Passes\Schemas;

use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Hidden;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class PassForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('pass_type')
                    ->options([
                        'resident' => 'Resident',
                        'visitor' => 'Visitor',
                        'delivery' => 'Delivery',
                    ])
                    ->required(),
                Select::make('household_id')
                    ->relationship('household', 'house_no')
                    ->required(),
                Select::make('issued_by_user_id')
                    ->relationship('issuedByUser', 'name')
                    ->required(),
                Select::make('subject_user_id')
                    ->relationship('subjectUser', 'name'),
                TextInput::make('visitor_name')
                    ->maxLength(255),
                Checkbox::make('has_vehicle'),
                TextInput::make('plate_no')
                    ->maxLength(255),
                TextInput::make('delivery_type')
                    ->maxLength(255),
                DateTimePicker::make('valid_from')
                    ->required(),
                DateTimePicker::make('valid_until')
                    ->required(),
                TextInput::make('usage_limit')
                    ->numeric()
                    ->default(1),
                TextInput::make('usage_count')
                    ->numeric()
                    ->disabled(),
                Select::make('status')
                    ->options([
                        'active' => 'Active',
                        'revoked' => 'Revoked',
                        'expired' => 'Expired',
                    ])
                    ->required(),
                Hidden::make('token_jti')
                    ->default(fn () => (string) Str::uuid()),
            ]);
    }
}
