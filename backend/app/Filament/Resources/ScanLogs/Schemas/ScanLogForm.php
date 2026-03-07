<?php

namespace App\Filament\Resources\ScanLogs\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ScanLogForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('pass_id')
                    ->relationship('pass', 'id'),
                Select::make('guard_user_id')
                    ->relationship('guardUser', 'name')
                    ->required(),
                Select::make('gate')
                    ->options([
                        'gate1' => 'Gate 1',
                        'gate2' => 'Gate 2',
                    ])
                    ->required(),
                Select::make('direction')
                    ->options([
                        'IN' => 'In',
                        'OUT' => 'Out',
                    ])
                    ->required(),
                Select::make('result')
                    ->options([
                        'VALID' => 'Valid',
                        'INVALID' => 'Invalid',
                        'EXPIRED' => 'Expired',
                        'REVOKED' => 'Revoked',
                        'USED' => 'Used',
                        'DENIED_RULE' => 'Denied Rule',
                    ])
                    ->required(),
                DateTimePicker::make('scanned_at')
                    ->required(),
                TextInput::make('raw_code_hash')
                    ->maxLength(255),
                Textarea::make('note'),
            ]);
    }
}
