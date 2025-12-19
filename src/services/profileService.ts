import api from './api';

export interface Vehicle {
    id: string;
    model: string;
    color: string;
    plate: string;
}

export interface Pet {
    id: string;
    name: string;
    type: string;
    breed: string;
}

export interface Profile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    unit_block?: string;
    unit_number?: string;
    role: string;
    profile_type?: string;
    vehicles: Vehicle[];
    pets: Pet[];
}

export const ProfileService = {
    getMe: async () => {
        const response = await api.get<Profile>('/profile/me');
        return response.data;
    },

    updateMe: async (data: { phone?: string }) => {
        const response = await api.patch<Profile>('/profile/me', data);
        return response.data;
    },

    addVehicle: async (vehicle: Omit<Vehicle, 'id'>) => {
        const response = await api.post<Vehicle>('/profile/vehicles', vehicle);
        return response.data;
    },

    deleteVehicle: async (id: string) => {
        await api.delete(`/profile/vehicles/${id}`);
    },

    addPet: async (pet: Omit<Pet, 'id'>) => {
        const response = await api.post<Pet>('/profile/pets', pet);
        return response.data;
    },

    deletePet: async (id: string) => {
        await api.delete(`/profile/pets/${id}`);
    }
};
