/**
 * Native platform image manipulation - re-exports from expo-image-manipulator.
 * On web, Metro resolves image-manipulator.web.ts instead (Canvas-based).
 */
export { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
export type { ImageResult } from 'expo-image-manipulator';
