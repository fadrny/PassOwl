import { api } from './api-client';
import type { PasswordCategory, PasswordCategoryCreate, PasswordCategoryUpdate } from './api';
import { getApiErrorDetail, getApiErrorStatus, type ApiResponse } from '$lib/types/api';

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
		} catch (error: unknown) {
			console.error('API error getting categories:', error);
			const status = getApiErrorStatus(error);

			if (status === 401) {
				return {
					error: {
						detail: 'Nejste přihlášeni. Přihlaste se prosím.',
						status: 401
					}
				};
			}

			return {
				error: {
					detail: getApiErrorDetail(error, 'Chyba při načítání kategorií'),
					status: status || 500
				}
			};
		}
	}

	/**
	 * Vytvoření nové kategorie
	 */
	static async createCategory(
		categoryData: CategoryCreateData
	): Promise<ApiResponse<PasswordCategory>> {
		try {
			const categoryCreate: PasswordCategoryCreate = {
				name: categoryData.name,
				color_hex: categoryData.color_hex || null
			};

			const response = await api.categories.createCategoryCategoriesPost(categoryCreate);
			return { data: response.data };
		} catch (error: unknown) {
			console.error('API error creating category:', error);

			return {
				error: {
					detail: getApiErrorDetail(error, 'Nepodařilo se vytvořit kategorii'),
					status: getApiErrorStatus(error) || 500
				}
			};
		}
	}

	/**
	 * Aktualizace kategorie
	 */
	static async updateCategory(
		id: number,
		categoryData: CategoryUpdateData
	): Promise<ApiResponse<PasswordCategory>> {
		try {
			const categoryUpdate: PasswordCategoryUpdate = {
				name: categoryData.name || null,
				color_hex: categoryData.color_hex || null
			};

			const response = await api.categories.updateCategoryCategoriesCategoryIdPut(
				id,
				categoryUpdate
			);
			return { data: response.data };
		} catch (error: unknown) {
			return {
				error: {
					detail: getApiErrorDetail(error, 'Nepodařilo se aktualizovat kategorii'),
					status: getApiErrorStatus(error) || 500
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
		} catch (error: unknown) {
			return {
				error: {
					detail: getApiErrorDetail(error, 'Nepodařilo se smazat kategorii'),
					status: getApiErrorStatus(error) || 500
				}
			};
		}
	}
}
