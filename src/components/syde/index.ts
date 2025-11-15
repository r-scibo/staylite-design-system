/**
 * Syde Voice Assistant Components
 * 
 * VOICE INTEGRATION STATUS:
 * - UI Complete: All visual components and animations ready
 * - Voice Ready: Architecture prepared for ElevenLabs API integration
 * 
 * Components:
 * - SydeContainer: Main wrapper with context provider
 * - SydeWidget: Floating widget (bottom-right)
 * - SydeAvatar: Animated avatar with states
 * - VoiceOverlay: Full-screen voice interface
 * - VoiceVisualizer: Audio frequency bars
 * - SearchAnimation: Search feedback UI
 * 
 * Integration Points for ElevenLabs:
 * - VoiceVisualizer: frequencyData prop ready for real audio data
 * - VoiceOverlay: Microphone handlers ready for voice recognition
 * - SydeConversationContext: Message flow ready for AI responses
 */

export { SydeContainer } from './SydeContainer';
export { SydeWidget } from './SydeWidget';
export { SydeAvatar } from './SydeAvatar';
export { VoiceOverlay } from './VoiceOverlay';
export { VoiceVisualizer } from './VoiceVisualizer';
export { SearchAnimation } from './SearchAnimation';
export { useSydeConversation } from '@/contexts/SydeConversationContext';