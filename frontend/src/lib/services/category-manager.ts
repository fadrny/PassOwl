import { api } from './api-client';
import type { PasswordCategory, PasswordCategoryCreate, PasswordCategoryUpdate } from './api';
import type { ApiResponse } from '$lib/types/api';

/**
 * Struktura pro vytvoření nové kategorie (frontend input)
 */
export interface CategoryCreateData {
  name: string;
  color_hex?: string;
}

/**
 * Struktura pro aktualizaci kategorie (frontend input)
 */
export interface CategoryUpdateData {
  name?: string;
  color_hex?: string;
}

export class CategoryManager {
  /**
   * Získání seznamu kategorií
   */
  static async getCategories(): Promise<ApiResponse<PasswordCategory[]>> {
    try {
      const response = await api.categories.getCategoriesCategoriesGet();
      return { data: response.data };
    } catch (error: any) {
      console.error('API error getting categories:', error);
      
      if (error.status === 401) {
        return {
          error: {
            detail: 'Nejste přihlášeni. Přihlaste se prosím.',
            status: 401
          }
        };
      }
      
      return {
        error: {
          detail: error.error?.detail || error.message || 'Chyba při načítání kategorií',
          status: error.status || 500
        }
      };
    }
  }

  /**
   * Vytvoření nové kategorie
   */
  static async createCategory(categoryData: CategoryCreateData): Promise<ApiResponse<PasswordCategory>> {
    try {
      const categoryCreate: PasswordCategoryCreate = {
        name: categoryData.name,
        color_hex: categoryData.color_hex || null
      };

      const response = await api.categories.createCategoryCategoriesPost(categoryCreate);
      return { data: response.data };
    } catch (error: any) {
      console.error('API error creating category:', error);
      
      return {
        error: {
          detail: error.error?.detail || error.message || 'Nepodařilo se vytvořit kategorii',
          status: error.status || 500
        }
      };
    }
  }

  /**
   * Aktualizace kategorie
   */
  static async updateCategory(id: number, categoryData: CategoryUpdateData): Promise<ApiResponse<PasswordCategory>> {
    try {
      const categoryUpdate: PasswordCategoryUpdate = {
        name: categoryData.name || null,
        color_hex: categoryData.color_hex || null
      };

      const response = await api.categories.updateCategoryCategoriesCategoryIdPut(id, categoryUpdate);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: {
          detail: error.error?.detail || error.message || 'Nepodařilo se aktualizovat kategorii',
          status: error.status || 500
        }
      };
    }
  }

  /**
   * Smazání kategorie
   */
  static async deleteCategory(id: number): Promise<ApiResponse<void>> {
    try {
      await api.categories.deleteCategoryCategoriesCategoryIdDelete(id);
      return { data: undefined };
    } catch (error: any) {
      return {
        error: {
          detail: error.error?.detail || error.message || 'Nepodařilo se smazat kategorii',
          status: error.status || 500
        }
      };
    }
  }
}