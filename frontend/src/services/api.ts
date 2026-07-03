// src/services/api.ts

import axios from 'axios';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// --- Models & provider settings ---

export const fetchModels = async () => {
    try {
        const response = await axios.get(`${API_URL}/settings/models`);
        return response.data; // { models, groups }
    } catch (error) {
        console.error('Error fetching models:', error);
        throw error;
    }
};

export const fetchSettings = async () => {
    try {
        const response = await axios.get(`${API_URL}/settings`);
        return response.data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
};

export const updateSettings = async (patch: { anthropicApiKey?: string }) => {
    try {
        const response = await axios.put(`${API_URL}/settings`, patch);
        return response.data;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};

export const enhancePrompt = async (prompt: string, generativeModel?: string): Promise<string> => {
    const response = await axios.post(`${API_URL}/promptEnhancement/enhance`, { prompt, generativeModel });
    return response.data.enhancedPrompt;
};

export const selectAlternative = async (cardId: string) => {
    const response = await axios.put(`${API_URL}/cards/${cardId}/select-alternative`);
    return response.data;
};

export const groupAlternatives = async (cardIds: string[]) => {
    const response = await axios.post(`${API_URL}/cards/group-alternatives`, { cardIds });
    return response.data;
};

export const ungroupAlternatives = async (cardIds: string[]) => {
    const response = await axios.post(`${API_URL}/cards/ungroup-alternatives`, { cardIds });
    return response.data;
};

export const fetchTasks = async () => {
    try {
        const response = await axios.get(`${API_URL}/tasks`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};

export const fetchTaskById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/tasks/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching task with id ${id}:`, error);
        throw error;
    }
};

export const fetchCardById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/cards/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching card with id ${id}:`, error);
        throw error;
    }
};

export const fetchPreviousCardsOutputs = async (cardId: string) => {
    try {
        const response = await axios.get(`${API_URL}/cards/previous-cards-outputs/${cardId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching previous cards outputs for card with id ${cardId}:`, error);
        throw error;
    }
};

export const createCard = async (card: any) => {
    try {
        const response = await axios.post(`${API_URL}/cards`, card);
        return response.data;
    } catch (error) {
        console.error('Error creating card:', error);
        throw error;
    }
};

export const setNextCard = async (currentCardId: string, nextCardIds: string[]) => {
    try {
        const response = await axios.put(`${API_URL}/cards/set-next/${currentCardId}`, { nextCardIds });
        return response.data;
    } catch (error) {
        console.error('Error setting next card:', error);
        throw error;
    }
};

export const executeCard = async (cardId: string) => {
    try {
        const response = await axios.post(`${API_URL}/cards/execute/${cardId}`);
        return response.data;
    } catch (error) {
        console.error('Error executing card:', error);
        throw error;
    }
};

export const evaluateCard = async (cardId: string) => {
    try {
        const response = await axios.post(`${API_URL}/cards/evaluate/${cardId}`);
        return response.data;
    } catch (error) {
        console.error('Error evaluating card:', error);
        throw error;
    }
};

export const deleteCard = async (cardId: string, taskId?: string) => {
    try {
        const response = await axios.delete(`${API_URL}/cards/${cardId}`, {
            data: { taskId }
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting card with id ${cardId}:`, error);
        throw error;
    }
};

export const updateCard = async (card: any) => {
    try {
        const response = await axios.put(`${API_URL}/cards/${card._id}`, card);
        return response.data;
    } catch (error) {
        console.error('Error updating card:', error);
        throw error;
    }
};

export const updateCardOutput = async (cardId: string, output: any) => {
    try {
        const response = await axios.put(`${API_URL}/cards/${cardId}/output`, output);
        return response.data;
    } catch (error) {
        console.error('Error updating card output:', error);
        throw error;
    }
}

export const createTask = async (task: any) => {
    try {
        const response = await axios.post(`${API_URL}/tasks`, task);
        return response.data;
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
};

export const removeNextCard = async (currentCardId: string, nextCardId: string) => {
    try {
        const response = await axios.put(`${API_URL}/cards/remove-next/${currentCardId}`, { nextCardId });
        return response.data;
    } catch (error) {
        console.error('Error removing next card:', error);
        throw error;
    }
};

export const deleteTask = async (id: string) => {
    try {
        const response = await axios.delete(`${API_URL}/tasks/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting task with id ${id}:`, error);
        throw error;
    }
};

export const fetchPlugins = async () => {
    try {
        const response = await axios.get(`${API_URL}/plugins`);
        return response.data.plugins;
    } catch (error) {
        console.error('Error fetching plugins:', error);
        throw error;
    }
};

export const executePlugin = async (pluginName: string, params: any) => {
    try {
        const response = await axios.post(`${API_URL}/plugins/${pluginName}/execute`, params);
        return response.data;
    } catch (error) {
        console.error(`Error executing ${pluginName} plugin:`, error);
        throw error;
    }
};

export const addPluginToCard = async (cardId: string, plugin: string) => {
    try {
        const response = await axios.put(`${API_URL}/cards/${cardId}/plugin`, { plugin });
        return response.data;
    } catch (error) {
        console.error('Error adding plugin to card:', error);
        throw error;
    }
};

export const removePluginFromCard = async (cardId: string, plugin: string) => {
    try {
        const response = await axios.put(`${API_URL}/cards/${cardId}/remove-plugin`, { plugin });
        return response.data;
    } catch (error) {
        console.error(`Error removing plugin to card with id ${cardId}:`, error);
        throw error;
    }
};