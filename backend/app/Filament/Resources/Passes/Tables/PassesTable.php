<?php

namespace App\Filament\Resources\Passes\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables;
use Filament\Tables\Table;

class PassesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('pass_type')->badge(),
                Tables\Columns\TextColumn::make('household.house_no')->searchable(),
                Tables\Columns\TextColumn::make('issuedByUser.name')->searchable(),
                Tables\Columns\TextColumn::make('visitor_name')->searchable(),
                Tables\Columns\TextColumn::make('valid_from')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('valid_until')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('status')->badge(),
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
