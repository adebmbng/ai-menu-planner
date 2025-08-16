import { format } from 'date-fns';
import { useEffect, useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, XMarkIcon, InformationCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useMenus } from '../../hooks/useMenus';
import { useUIStore } from '../../state/ui';
import { ShoppingListDrawer } from '../shopping/ShoppingListDrawer';
import type { Recipe } from '../../types/menu';

export function WeeklyPlanner() {
    const hasInitialized = useRef(false);
    const [shoppingListOpen, setShoppingListOpen] = useState(false);
    const {
        currentWeek,
        currentWeekStart,
        isLoading,
        error,
        loadRecipes,
        goToCurrentWeek,
        goToPreviousWeek,
        goToNextWeek,
        assignRecipeToDay,
        removeRecipeFromDay,
        clearDayMeals
    } = useMenus();

    // Load recipes and current week on mount - use ref to avoid re-runs
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            loadRecipes();
            goToCurrentWeek();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Safe to use empty deps because we use ref to track initialization

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card rounded-xl p-6">
                <div className="text-center text-red-600">
                    <p className="font-medium">Error loading menu</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button
                        onClick={goToCurrentWeek}
                        className="mt-3 modern-button-primary-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!currentWeek || !currentWeekStart) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Week Navigation Header */}
            <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                            <CalendarIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Weekly Menu</h2>
                            <p className="text-sm text-gray-500">
                                Week starting {format(new Date(currentWeekStart), 'MMM d, yyyy')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="modern-button-primary-sm gap-2"
                            onClick={() => setShoppingListOpen(true)}
                        >
                            <ShoppingCartIcon className="h-4 w-4" />
                            Generate Shopping List
                        </button>
                        <button
                            className="modern-button-secondary-sm"
                            onClick={goToPreviousWeek}
                        >
                            <ChevronLeftIcon className="h-3 w-3" />
                        </button>
                        <button
                            className="modern-button-secondary-sm"
                            onClick={goToCurrentWeek}
                        >
                            Today
                        </button>
                        <button
                            className="modern-button-secondary-sm"
                            onClick={goToNextWeek}
                        >
                            <ChevronRightIcon className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Week Grid - All 7 days */}
            <div className="glass-card rounded-xl overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-200/50">
                    {currentWeek.days.map((day) => {
                        const date = new Date(day.date);
                        const dayName = format(date, 'EEEE');
                        const dayNumber = format(date, 'd');
                        const monthDay = format(date, 'MMM d');
                        const isToday = format(new Date(), 'yyyy-MM-dd') === day.date;

                        return (
                            <div
                                key={day.date}
                                className={`p-3 text-center border-r border-gray-200/50 last:border-r-0 ${isToday ? 'bg-blue-50/70' : ''
                                    }`}
                            >
                                <div className={`font-semibold text-sm ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                    {dayName}
                                </div>
                                <div className="text-xs text-gray-500 mb-1">{monthDay}</div>
                                <div className={`
                  inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                  ${isToday
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600'
                                    }
                `}>
                                    {dayNumber}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Day columns with meals */}
                <div className="grid grid-cols-7 min-h-[400px]">
                    {currentWeek.days.map((day) => (
                        <DayColumn
                            key={day.date}
                            date={day.date}
                            meals={day.meals}
                            onAssignRecipe={assignRecipeToDay}
                            onRemoveRecipe={removeRecipeFromDay}
                            onClearDay={clearDayMeals}
                        />
                    ))}
                </div>
            </div>

            {/* Shopping List Drawer */}
            <ShoppingListDrawer
                open={shoppingListOpen}
                onOpenChange={setShoppingListOpen}
                weekStart={currentWeekStart || ''}
            />
        </div>
    );
}

interface DayColumnProps {
    date: string;
    meals: Recipe[];
    onAssignRecipe: (date: string, recipe: Recipe) => void;
    onRemoveRecipe: (date: string, recipeId: string) => Promise<void>;
    onClearDay: (date: string) => void;
}

function DayColumn({ date, meals, onRemoveRecipe }: DayColumnProps) {
    const [input, setInput] = useState('');
    const isToday = format(new Date(), 'yyyy-MM-dd') === date;

    const { setNodeRef, isOver } = useDroppable({
        id: `day-${date}`,
        data: {
            type: 'day',
            date,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`
        p-4 border-r border-gray-200/50 last:border-r-0 min-h-[400px] transition-all duration-200 relative
        ${isOver ? 'drop-zone drag-over bg-blue-50' : 'drop-zone'}
        ${isToday ? 'bg-blue-50/30' : ''}
      `}
        >
            {/* Meals list */}
            <div className="space-y-2 mb-4">
                <SortableContext items={meals.map((_recipe, index) => `meal-${date}-${index}`)} strategy={verticalListSortingStrategy}>
                    {meals.map((recipe, index) => (
                        <MealItem
                            key={`meal-${date}-${index}`}
                            recipe={recipe}
                            date={date}
                            index={index}
                            onRemove={async () => await onRemoveRecipe(date, recipe.id)}
                        />
                    ))}
                </SortableContext>

                {meals.length === 0 && (
                    <div className="flex items-center justify-center h-36 border-2 border-dashed border-gray-300/60 rounded-xl bg-gray-50/30">
                        <div className="text-center">
                            <div className="text-gray-500 text-caption font-medium mb-1">Drop recipe here</div>
                            <div className="text-gray-400 text-xs">or add below</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick add meal input */}
            <div className="space-y-3 mt-auto">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Quick add meal..."
                    className="w-full text-body p-3 border border-gray-300/60 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-500"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && input.trim()) {
                            // For now, just show a placeholder for quick entry
                            // TODO: Implement quick recipe creation or search
                            console.log('Quick add:', input.trim());
                            setInput('');
                        }
                    }}
                />
                <div className="text-caption text-gray-500 text-center">
                    Drag recipes from library or type to quick-add
                </div>
            </div>
        </div>
    );
}

interface MealItemProps {
    recipe: Recipe;
    date: string;
    index: number;
    onRemove: () => Promise<void>;
}

function MealItem({ recipe, date, index, onRemove }: MealItemProps) {
    const { setRecipeDetailModalOpen, setSelectedRecipeId } = useUIStore()
    const [isDeleting, setIsDeleting] = useState(false)

    const uniqueId = `meal-${date}-${index}`

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: uniqueId,
        data: {
            type: 'meal',
            recipe,
            source: 'meal' as const,
            sourceDate: date,
            sourceIndex: index,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleTitleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setSelectedRecipeId(recipe.id)
        setRecipeDetailModalOpen(true)
    }

    const handleRemove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);
        try {
            await onRemove();
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        group relative recipe-card rounded-xl p-4 transition-all duration-200 cursor-pointer
        ${isDragging ? 'draggable dragging shadow-lg z-50 scale-105' : 'draggable hover:shadow-md'}
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
            {...attributes}
            {...listeners}
        >
            {/* Delete button - positioned absolutely in top-right */}
            <button
                className={`
          absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 z-10
          ${isDeleting
                        ? 'bg-red-100 text-red-400 cursor-not-allowed'
                        : 'opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-500'
                    }
        `}
                onClick={handleRemove}
                disabled={isDeleting}
                title={isDeleting ? "Removing..." : "Remove recipe"}
            >
                <XMarkIcon className="h-4 w-4" />
            </button>

            <div className="pr-8"> {/* Add right padding to avoid overlap with delete button */}
                <div className="mb-2">
                    <div
                        className="text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex items-start gap-2 leading-snug"
                        onClick={handleTitleClick}
                        title="Click to view recipe details"
                    >
                        <span className="break-words flex-1">{recipe.title}</span>
                        <InformationCircleIcon className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0 mt-0.5 text-blue-500" />
                    </div>
                </div>

                {recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {recipe.tags.slice(0, 3).map(tag => (
                            <span
                                key={tag}
                                className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md"
                            >
                                {tag}
                            </span>
                        ))}
                        {recipe.tags.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-md">
                                +{recipe.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {recipe.time_minutes && (
                    <div className="flex items-center gap-1.5 text-caption text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="font-medium">{recipe.time_minutes} minutes</span>
                    </div>
                )}
            </div>
        </div>
    );
}
