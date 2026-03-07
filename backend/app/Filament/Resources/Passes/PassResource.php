<?php

namespace App\Filament\Resources\Passes;

use App\Filament\Resources\Passes\Pages\CreatePass;
use App\Filament\Resources\Passes\Pages\EditPass;
use App\Filament\Resources\Passes\Pages\ListPasses;
use App\Filament\Resources\Passes\Schemas\PassForm;
use App\Filament\Resources\Passes\Tables\PassesTable;
use App\Models\Pass;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PassResource extends Resource
{
    protected static ?string $model = Pass::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return PassForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PassesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPasses::route('/'),
            'create' => CreatePass::route('/create'),
            'edit' => EditPass::route('/{record}/edit'),
        ];
    }
}
