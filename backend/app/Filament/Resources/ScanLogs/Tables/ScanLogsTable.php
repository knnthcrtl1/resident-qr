<?php

namespace App\Filament\Resources\ScanLogs\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables;
use Filament\Tables\Table;

class ScanLogsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('pass.id')->label('Pass ID'),
                Tables\Columns\TextColumn::make('guardUser.name')->searchable(),
                Tables\Columns\TextColumn::make('gate')->badge(),
                Tables\Columns\TextColumn::make('direction')->badge(),
                Tables\Columns\TextColumn::make('result')->badge(),
                Tables\Columns\TextColumn::make('scanned_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('note'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
