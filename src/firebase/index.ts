'use client';

/**
 * BARREL FILE FOR FIREBASE
 * 
 * This file centralizes exports but DOES NOT contain initialization logic
 * to avoid circular dependency loops in Next.js.
 */

export * from './init';
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
export * from './non-blocking-updates';
