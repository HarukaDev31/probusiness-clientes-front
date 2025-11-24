<template>
  <main>
    <UserProfileSkeleton v-if="isLoading" />
    <UserProfileComponent 
      v-else 
      :userProfile="profile" 
      class="user-profile" 
      @profile-updated="handleProfileUpdate" 
    />
    <!-- <Sidebar :userProfile="userProfile" class="sidebar" /> -->
  </main>
</template>
<script setup lang="ts">
import UserProfileSkeleton from '@/components/profile/UserProfileSkeleton.vue';
import type { UserProfile } from '@/types/userprofile';
import UserProfileComponent from '@/components/profile/UserProfileComponent.vue';
import { useProfile } from '@/composables/clientes/commons/profile';
const { profile, loading, error, getProfile } = useProfile();
const isLoading = ref(true);

// Función para manejar la actualización del perfil
const handleProfileUpdate = async () => {
  try {
    isLoading.value = true;
    await getProfile(); // Recargar los datos del perfil desde el backend
    isLoading.value = false;
  } catch (error) {
    console.error('Error al recargar el perfil:', error);
    isLoading.value = false;
  }
};
onMounted(async () => {
  try {
    const response = await getProfile();
    if (!response.success) {
      throw new Error('Error al cargar los datos del perfil');
    }

    isLoading.value = false;
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    // isLoading.value = false;
  }


});
</script>