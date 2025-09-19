import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Send, Bot, User, Loader, Lightbulb, Sprout, Cloud, Bug } from 'lucide-react-native';
import { useFarmData } from '@/hooks/useFarmData';
import { useGeminiAI } from '@/hooks/useGeminiAI';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { sensorData, getCropRecommendations } = useFarmData();
  const { askGemini } = useGeminiAI();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    // Welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hello! I'm your AI farming assistant. I can help you with crop recommendations, pest management, weather advice, and farming best practices. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    triggerHaptic();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare context with current farm data
      let context = "Current farm conditions:\n";
      if (sensorData) {
        context += `- Temperature: ${sensorData.insideTemp}°C\n`;
        context += `- Soil Moisture: ${sensorData.moisture}%\n`;
        context += `- Humidity: ${sensorData.insideHumidity}%\n`;
        context += `- Light Level: ${sensorData.light}\n`;
        
        // Add crop recommendations if available
        const recommendations = getCropRecommendations(
          sensorData.insideTemp,
          sensorData.moisture,
          sensorData.insideHumidity
        );
        if (recommendations.length > 0) {
          context += `- Suitable crops for current conditions: ${recommendations.map(c => c.crop_name).join(', ')}\n`;
        }
      }

      const fullPrompt = `${context}\nFarmer's question: ${inputText.trim()}\n\nPlease provide helpful, practical farming advice. Keep responses concise and actionable.`;

      const response = await askGemini(fullPrompt);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later or check your internet connection.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendQuickQuestion = (question: string) => {
    setInputText(question);
  };

  const quickQuestions = [
    "What crops should I plant now?",
    "How to improve soil health?",
    "Pest control recommendations",
    "Weather impact on crops",
    "Irrigation best practices",
    "Fertilizer recommendations"
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Bot size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Farm Assistant</Text>
            <Text style={styles.headerSubtitle}>Powered by Gemini AI</Text>
          </View>
        </View>
        <View style={styles.statusIndicator}>
          <View style={styles.onlineDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.aiMessage
              ]}
            >
              <View style={styles.messageHeader}>
                <View style={[
                  styles.messageIcon,
                  message.isUser ? styles.userIcon : styles.aiIcon
                ]}>
                  {message.isUser ? (
                    <User size={16} color="#FFFFFF" />
                  ) : (
                    <Bot size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              <View style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.aiText
                ]}>
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={styles.messageHeader}>
                <View style={[styles.messageIcon, styles.aiIcon]}>
                  <Bot size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.messageTime}>Now</Text>
              </View>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.loadingContainer}>
                  <Loader size={16} color="#16A34A" />
                  <Text style={styles.loadingText}>Thinking...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <View style={styles.quickQuestionsContainer}>
            <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickQuestionsContent}
            >
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionButton}
                  onPress={() => sendQuickQuestion(question)}
                >
                  <Lightbulb size={14} color="#16A34A" />
                  <Text style={styles.quickQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about farming, crops, weather..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userIcon: {
    backgroundColor: '#3B82F6',
  },
  aiIcon: {
    backgroundColor: '#16A34A',
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#1F2937',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#16A34A',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickQuestionsContent: {
    paddingRight: 20,
  },
  quickQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  quickQuestionText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#16A34A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});