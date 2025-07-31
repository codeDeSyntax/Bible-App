// import { useState, useEffect, useRef } from 'react';
// import { Mic, MicOff, Loader2, AlertCircle, Check, Wifi, Volume2 } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// // Types for our component
// type VoiceListenerProps = {
//   onTextCaptured?: (text: string) => void;
//   primaryColor?: string;
//   secondaryColor?: string;
//   size?: 'small' | 'medium' | 'large';
//   lang?: string;
// };

// type ListeningState = 'idle' | 'listening' | 'processing' | 'error' | 'success';

// // Error types that can occur during speech recognition
// type ErrorType = 'network' | 'no-speech' | 'permission' | 'aborted' | 'audio-capture' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported' | 'no-match' | 'unsupported' | 'other';

// export default function VoiceListener({
//   onTextCaptured = () => {},
//   primaryColor = '#4f46e5', // Indigo color
//   secondaryColor = '#818cf8', // Lighter indigo
//   size = 'medium',
//   lang = 'en-US',
// }: VoiceListenerProps) {
//   // State management
//   const [listeningState, setListeningState] = useState<ListeningState>('idle');
//   const [transcribedText, setTranscribedText] = useState<string>('');
//   const [errorMessage, setErrorMessage] = useState<string>('');
//   const [errorType, setErrorType] = useState<ErrorType | null>(null);
//   const [isMounted, setIsMounted] = useState<boolean>(false);
//   const [hasAttemptedReconnect, setHasAttemptedReconnect] = useState<boolean>(false);
  
//   // Refs
//   // Declare SpeechRecognition type for TypeScript
//     const recognitionRef = useRef<(typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition) | null>(null);
//   const reconnectTimeoutRef = useRef<number | null>(null);
  
//   // Determine button size based on prop
//   const buttonSize = {
//     small: {
//       button: 'h-12 w-12',
//       icon: 16,
//       font: 'text-xs',
//       container: 'max-w-xs',
//     },
//     medium: {
//       button: 'h-16 w-16',
//       icon: 24,
//       font: 'text-sm',
//       container: 'max-w-sm',
//     },
//     large: {
//       button: 'h-20 w-20',
//       icon: 32,
//       font: 'text-base',
//       container: 'max-w-md',
//     },
//   }[size];

//   // Set up speech recognition when component mounts
//   useEffect(() => {
//     setIsMounted(true);
    
//     // Clean up function for when component unmounts
//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.onend = null;
//         recognitionRef.current.stop();
//       }
      
//       // Clear any pending timeouts
//       if (reconnectTimeoutRef.current) {
//         window.clearTimeout(reconnectTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Helper function to get a user-friendly error message
//   const getErrorMessage = (error: string): { message: string; type: ErrorType } => {
//     switch (error) {
//       case 'network':
//         return { 
//           message: 'Network error. Check your internet connection.', 
//           type: 'network' 
//         };
//       case 'no-speech':
//         return { 
//           message: 'No speech detected. Please try speaking again.', 
//           type: 'no-speech' 
//         };
//       case 'audio-capture':
//         return { 
//           message: 'Audio capture failed. Please check your microphone.', 
//           type: 'audio-capture' 
//         };
//       case 'not-allowed':
//       case 'service-not-allowed':
//         return { 
//           message: 'Microphone access denied. Please enable microphone permissions.', 
//           type: 'permission' 
//         };
//       case 'aborted':
//         return { 
//           message: 'Speech recognition was aborted.', 
//           type: 'aborted' 
//         };
//       case 'language-not-supported':
//         return { 
//           message: `Language "${lang}" is not supported.`, 
//           type: 'language-not-supported' 
//         };
//       case 'no-match':
//         return { 
//           message: 'Could not recognize speech. Please try again.', 
//           type: 'no-match' 
//         };
//       default:
//         return { 
//           message: `Error: ${error}`, 
//           type: 'other' 
//         };
//     }
//   };

//   // Function to attempt a reconnection if a network error occurs
//   const attemptReconnection = () => {
//     if (hasAttemptedReconnect) return;
    
//     setHasAttemptedReconnect(true);
    
//     // Wait 2 seconds before attempting to reconnect
//     reconnectTimeoutRef.current = window.setTimeout(() => {
//       initializeSpeechRecognition();
      
//       if (recognitionRef.current) {
//         try {
//           recognitionRef.current.start();
//           setErrorMessage('Reconnected! Please speak now.');
//           setListeningState('listening');
//         } catch (error) {
//           setErrorMessage('Failed to reconnect. Please try again later.');
//           setListeningState('error');
//         }
//       }
      
//       // Reset the reconnect attempt flag after 5 seconds
//       window.setTimeout(() => {
//         setHasAttemptedReconnect(false);
//       }, 5000);
//     }, 2000);
//   };

//   // Initialize speech recognition (only run in browser, not during SSR)
//   const initializeSpeechRecognition = () => {
//     if (!isMounted) return;
    
//     try {
//       // Check if browser supports SpeechRecognition
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
//       if (!SpeechRecognition) {
//         throw new Error('Speech recognition not supported in this browser.');
//       }
      
//       const recognition = new SpeechRecognition();
//       recognition.continuous = false;
//       recognition.interimResults = true;
//       recognition.lang = lang;
      
//       recognition.onstart = () => {
//         setListeningState('listening');
//         setErrorMessage('');
//         setErrorType(null);
//       };
      
//       let finalTranscript = '';
      
//       recognition.onresult = (event: { resultIndex: any; results: string | any[]; }) => {
//         let interimTranscript = '';
        
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           const transcript = event.results[i][0].transcript;
          
//           if (event.results[i].isFinal) {
//             finalTranscript += transcript;
//           } else {
//             interimTranscript += transcript;
//           }
//         }
        
//         // Update with either the final transcript or the interim one
//         setTranscribedText(finalTranscript || interimTranscript);
//       };
      
//       recognition.onerror = (event: { error: string; }) => {
//         const { message, type } = getErrorMessage(event.error);
        
//         console.error('Speech recognition error:', event.error);
//         setListeningState('error');
//         setErrorMessage(message);
//         setErrorType(type);
        
//         // Attempt to reconnect for network errors
//         if (type === 'network' && !hasAttemptedReconnect) {
//           attemptReconnection();
//         }
//       };
      
//       recognition.onend = () => {
//         if (listeningState === 'listening') {
//           setListeningState('processing');
          
//           // Simulate processing time
//           setTimeout(() => {
//             if (transcribedText.trim()) {
//               setListeningState('success');
//               onTextCaptured(transcribedText);
              
//               // Reset after showing success
//               setTimeout(() => {
//                 setListeningState('idle');
//               }, 1500);
//             } else {
//               setListeningState('error');
//               setErrorMessage('No speech detected. Please try again.');
//               setErrorType('no-speech');
              
//               // Reset after showing error
//               setTimeout(() => {
//                 setListeningState('idle');
//               }, 2000);
//             }
//           }, 800);
//         }
//       };
      
//       recognitionRef.current = recognition;
//     } catch (error) {
//       console.error('Error initializing speech recognition:', error);
//       setListeningState('error');
//       setErrorMessage(error instanceof Error ? error.message : 'Unknown error initializing speech recognition');
//       setErrorType('unsupported');
//     }
//   };

//   // Handle click on the voice button
//   const handleVoiceButtonClick = () => {
//     if (listeningState !== 'idle') {
//       // Stop listening if already active
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//       setListeningState('idle');
//       return;
//     }
    
//     // Initialize speech recognition if not already
//     if (!recognitionRef.current) {
//       initializeSpeechRecognition();
//     }
    
//     try {
//       // Start listening
//       recognitionRef.current?.start();
//       setTranscribedText('');
//       setErrorType(null);
//     } catch (error) {
//       console.error('Error starting speech recognition:', error);
//       setListeningState('error');
//       setErrorMessage('Failed to start speech recognition. Please try again.');
//       setErrorType('other');
//     }
//   };

//   // Render the appropriate icon based on the listening state and error type
//   const renderIcon = () => {
//     if (listeningState === 'error') {
//       switch (errorType) {
//         case 'network':
//           return <Wifi size={buttonSize.icon} className="text-white" />;
//         case 'audio-capture':
//         case 'permission':
//         case 'not-allowed':
//           return <Volume2 size={buttonSize.icon} className="text-white" />;
//         default:
//           return <AlertCircle size={buttonSize.icon} className="text-white" />;
//       }
//     }
    
//     switch (listeningState) {
//       case 'listening':
//         return (
//           <motion.div
//             animate={{ scale: [1, 1.2, 1] }}
//             transition={{ repeat: Infinity, duration: 1.5 }}
//           >
//             <Mic size={buttonSize.icon} className="text-white" />
//           </motion.div>
//         );
//       case 'processing':
//         return <Loader2 size={buttonSize.icon} className="text-white animate-spin" />;
//       case 'success':
//         return <Check size={buttonSize.icon} className="text-white" />;
//       default:
//         return <Mic size={buttonSize.icon} className="text-white" />;
//     }
//   };

//   // Get the background color based on the listening state
//   const getBackgroundColor = () => {
//     switch (listeningState) {
//       case 'listening':
//         return secondaryColor;
//       case 'processing':
//         return primaryColor;
//       case 'error':
//         return '#ef4444'; // Red
//       case 'success':
//         return '#10b981'; // Green
//       default:
//         return primaryColor;
//     }
//   };

//   // Get a suggestion based on the error type
//   const getErrorSuggestion = () => {
//     switch (errorType) {
//       case 'network':
//         return 'Check your internet connection and try again.';
//       case 'permission':
//       case 'not-allowed':
//         return 'Please allow microphone access in your browser settings.';
//       case 'audio-capture':
//         return 'Check if your microphone is properly connected and working.';
//       case 'no-speech':
//         return 'Speak clearly into your microphone and try again.';
//       default:
//         return 'Try again or reload the page.';
//     }
//   };

//   return (
//     <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-50">
//       <AnimatePresence>
//         {/* Transcribed text appears above button */}
//         {transcribedText && listeningState !== 'idle' && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 10 }}
//             className={`bg-white dark:bg-gray-800 rounded-lg p-3 mb-4 shadow-lg ${buttonSize.container} text-center`}
//           >
//             <p className={`${buttonSize.font} text-gray-700 dark:text-gray-200`}>
//               {transcribedText || "Listening..."}
//             </p>
//           </motion.div>
//         )}
        
//         {/* Error message appears above button */}
//         {errorMessage && listeningState === 'error' && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 10 }}
//             className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg p-3 mb-4 shadow-lg max-w-xs text-center"
//           >
//             <p className={`${buttonSize.font} font-medium`}>{errorMessage}</p>
//             <p className={`${buttonSize.font} mt-1 text-red-500 dark:text-red-400 opacity-80`}>
//               {getErrorSuggestion()}
//             </p>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Main button */}
//       <motion.button
//         style={{ backgroundColor: getBackgroundColor() }}
//         whileTap={{ scale: 0.95 }}
//         className={`${buttonSize.button} rounded-full flex items-center justify-center shadow-lg focus:outline-none relative group overflow-hidden`}
//         onClick={handleVoiceButtonClick}
//         aria-label={listeningState === 'listening' ? 'Stop listening' : 'Start listening'}
//       >
//         {/* Ripple effect when listening */}
//         {listeningState === 'listening' && (
//           <>
//             <motion.div
//               className="absolute inset-0 rounded-full bg-white opacity-20"
//               animate={{ 
//                 scale: [1, 1.5, 1.8],
//                 opacity: [0.2, 0.1, 0]
//               }}
//               transition={{ 
//                 duration: 1.5,
//                 repeat: Infinity,
//                 ease: "easeOut"
//               }}
//             />
//             <motion.div
//               className="absolute inset-0 rounded-full bg-white opacity-20"
//               animate={{ 
//                 scale: [1, 1.3, 1.6],
//                 opacity: [0.2, 0.1, 0]
//               }}
//               transition={{ 
//                 duration: 1.5,
//                 repeat: Infinity,
//                 ease: "easeOut",
//                 delay: 0.5
//               }}
//             />
//           </>
//         )}
        
//         {/* Error pulse effect for network issues */}
//         {listeningState === 'error' && errorType === 'network' && (
//           <motion.div
//             className="absolute inset-0 rounded-full bg-white opacity-20"
//             animate={{ 
//               scale: [1, 1.2, 1],
//               opacity: [0.2, 0.3, 0.2]
//             }}
//             transition={{ 
//               duration: 2,
//               repeat: Infinity,
//               ease: "easeInOut"
//             }}
//           />
//         )}
        
//         {/* Button content with icon */}
//         <motion.div
//           animate={{ 
//             rotate: listeningState === 'listening' ? [0, 5, -5, 0] : 0,
//             scale: (listeningState === 'error' && errorType === 'network' && hasAttemptedReconnect) ? [1, 1.1, 1] : 1
//           }}
//           transition={{ 
//             repeat: (listeningState === 'listening' || (listeningState === 'error' && errorType === 'network' && hasAttemptedReconnect)) ? Infinity : 0, 
//             duration: 0.5 
//           }}
//         >
//           {renderIcon()}
//         </motion.div>
//       </motion.button>
//     </div>
//   );
// }

