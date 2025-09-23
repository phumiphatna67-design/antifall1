/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const fileToPart = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    return { mimeType: mimeMatch[1], data: arr[1] };
}

const handleApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    // Find the first image part in any candidate
    for (const candidate of response.candidates ?? []) {
        const imagePart = candidate.content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const { mimeType, data } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        throw new Error(errorMessage);
    }
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image. ` + (textFeedback ? `The model responded with text: "${textFeedback}"` : "This can happen due to safety filters or if the request is too complex. Please try a different image.");
    throw new Error(errorMessage);
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash-image-preview';

export const generateGymPhoto = async (userImage: File, gender: 'ชาย' | 'หญิง'): Promise<string> => {
    const userImagePart = await fileToPart(userImage);
    const prompt = gender === 'หญิง'
        ? `You are an expert photorealistic AI artist. You will be given an image containing a person's face. Your task is to create a new, high-quality, photorealistic image.
**Instructions:**
1. **Preserve Face:** Accurately use the face, head, and skin tone from the provided image. The person's identity must be clearly recognizable.
2. **Generate Body:** Create a new, athletic, fit, and well-defined body (fit & firm) for this person. She should be wearing stylish fitness attire that compliments her physique.
3. **Set the Scene:** The background must be a modern, well-lit gym environment.
4. **Define the Action:** The person should be in the act of drinking water from a water bottle, looking refreshed, radiant, and beautiful during a workout break.
5. **Final Image:** The output must be a single, photorealistic image. Return ONLY the final image and no text.`
        : `You are an expert photorealistic AI artist. You will be given an image containing a person's face. Your task is to create a new, high-quality, photorealistic image.
**Instructions:**
1. **Preserve Face:** Accurately use the face, head, and skin tone from the provided image. The person's identity must be clearly recognizable.
2. **Generate Body:** Create a new, athletic, fit, and well-defined body (fit & firm) for this person. The person should be shirtless to show their physique.
3. **Set the Scene:** The background must be a modern, well-lit gym environment.
4. **Define the Action:** The person should be in the act of drinking water from a water bottle, looking refreshed during a workout break.
5. **Final Image:** The output must be a single, photorealistic image. Return ONLY the final image and no text.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [userImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleApiResponse(response);
};

export const generateAgedPhoto = async (userImage: File, gender: 'ชาย' | 'หญิง'): Promise<string> => {
    const userImagePart = await fileToPart(userImage);
    const prompt = `You are an expert photorealistic AI artist. You will be given an image containing a person's face. Your task is to create a new, high-quality, photorealistic image that serves as a cautionary visual.
**Instructions:**
1. **Preserve Face:** Accurately use the face, head, and skin tone from the provided image. The person's identity must be clearly recognizable.
2. **Age the Person:** Age the individual to look approximately 60 years old.
3. **Illustrate Sarcopenia:** Depict the person with signs of severe sarcopenia (age-related muscle loss). This ${gender === 'ชาย' ? 'man' : 'woman'} should appear frail, thin, with very little muscle mass, and look unhealthy. This is to visualize the negative consequences of not exercising.
4. **Set the Scene:** Place them in a simple, dimly lit, uncluttered indoor environment.
5. **Expression:** The person's expression should be neutral or slightly somber.
6. **Final Image:** The output must be a single, photorealistic image. Return ONLY the final image and no text.`;

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [userImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleApiResponse(response);
};