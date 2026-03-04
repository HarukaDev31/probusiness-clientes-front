import { BaseService } from '~/services/base/BaseService'
import type { UserProfile, UserProfileResponse, UserBusiness } from '~/types/userprofile'

export class ProfileService extends BaseService {
    private static baseUrl = 'api/auth/clientes'
    
    // Función auxiliar para debug del FormData
    private static debugFormData(formData: FormData) {
        console.log('FormData contents:');
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
    }
    
    static async getProfile(): Promise<UserProfileResponse> {
        try {
            const response = await this.apiCall<any>(`${this.baseUrl}/me`)
            // /me devuelve IDs en id_country/id_department/id_province/id_district
            // y nombres en country/department/city/district
            if (response.user) {
                response.user.idCountry = response.user.id_country ?? 1  // default Perú
                response.user.idDepartment = response.user.id_department ?? null
                response.user.idProvince = response.user.id_province ?? null
                response.user.idDistrict = response.user.id_district ?? null
                response.user.countryName = response.user.country ?? null
                response.user.departamentoName = response.user.department ?? null
                response.user.cityName = response.user.city ?? null
                response.user.distritoName = response.user.district ?? null
            }
            return response as UserProfileResponse
        } catch (error) {
            console.error('Error al cargar el perfil:', error)
            throw error
        }
    }

    static async updateProfile(profileData: any, photoFile?: File): Promise<UserProfileResponse> {
        try {
            const formData = new FormData()
            
            
            // Agregar campos del perfil con los nombres EXACTOS que espera el backend
            if (profileData.fullName !== undefined) formData.append('full_name', profileData.fullName)
            if (profileData.email !== undefined) formData.append('email', profileData.email)
            
            // CORREGIR: usar 'dni' - campo correcto
            if (profileData.dni !== undefined) formData.append('dni', profileData.dni)
            
            // CORREGIR: usar 'fecha_nacimiento' - campo correcto
            if (profileData.fecha_nacimiento !== undefined) formData.append('fecha_nacimiento', profileData.fecha_nacimiento)
            
            if (profileData.country !== undefined) formData.append('country', profileData.country.toString())
            if (profileData.city !== undefined) formData.append('city', profileData.city.toString())
            
            // CORREGIR: usar 'departamento' - campo correcto
            if (profileData.departamento !== undefined) formData.append('departamento', profileData.departamento.toString())
            
            // CORREGIR: usar 'distrito' - campo correcto
            if (profileData.distrito !== undefined) formData.append('distrito', profileData.distrito.toString())
            
            if (profileData.phone !== undefined) formData.append('phone', profileData.phone)
            if (profileData.goals !== undefined) formData.append('goals', profileData.goals)
            
            // Agregar foto si existe
            if (photoFile) {
                formData.append('photo', photoFile)
            }

            // Debug: mostrar contenido del FormData
            console.log('🔍 Debug SERVICE - FormData contents:');
            for (const [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            const response = await this.apiCall<any>(`${this.baseUrl}/profile`, {
                method: 'POST',
                body: formData
            })
            // /profile devuelve IDs en country/city/departamento/distrito
            // y nombres en countryName/cityName/departamentoName/distritoName
            if (response.user) {
                response.user.idCountry = response.user.country ?? 1  // default Perú
                response.user.idDepartment = response.user.departamento ?? null
                response.user.idProvince = response.user.city ?? null
                response.user.idDistrict = response.user.distrito ?? null
            }
            return response as UserProfileResponse
        } catch (error) {
            console.error('Error al actualizar el perfil:', error)
            throw error
        }
    }

    static async updateBusiness(businessData: Partial<UserBusiness>): Promise<{ business: UserBusiness }> {
        try {
            const formData = new FormData()
            
            // Agregar campos de la empresa (incluir campos vacíos también)
            if (businessData.name !== undefined) formData.append('business_name', businessData.name)
            if (businessData.ruc !== undefined) formData.append('business_ruc', businessData.ruc)
            if (businessData.comercialCapacity !== undefined) formData.append('comercial_capacity', businessData.comercialCapacity)
            if (businessData.rubric !== undefined) formData.append('rubric', businessData.rubric)
            if (businessData.socialAddress !== undefined) formData.append('social_address', businessData.socialAddress)

            // Debug: mostrar contenido del FormData
            this.debugFormData(formData);

            const response = await this.apiCall<{ business: UserBusiness }>(`${this.baseUrl}/business`, {
                method: 'POST',
                body: formData
            })
            return response
        } catch (error) {
            console.error('Error al actualizar la empresa:', error)
            throw error
        }
    }

    static async uploadProfilePhoto(file: File): Promise<{ photoUrl: string }> {
        try {
            const formData = new FormData()
            formData.append('photo', file)

            const response = await this.apiCall<{ photoUrl: string }>(`${this.baseUrl}/photo`, {
                method: 'POST',
                body: formData
            })
            return response
        } catch (error) {
            console.error('Error al subir la foto:', error)
            throw error
        }
    }
}