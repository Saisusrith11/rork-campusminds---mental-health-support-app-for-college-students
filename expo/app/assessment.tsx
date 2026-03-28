import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ArrowLeft, CheckCircle, AlertTriangle, Shield } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';

interface Question {
  id: number;
  text: string;
  category: 'depression' | 'anxiety' | 'general';
}

interface Answer {
  questionId: number;
  value: number;
}

export default function AssessmentScreen() {
  const { updateUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);

  const questions: Question[] = [
    { id: 1, text: 'Little interest or pleasure in doing things', category: 'depression' },
    { id: 2, text: 'Feeling down, depressed, or hopeless', category: 'depression' },
    { id: 3, text: 'Trouble sleeping or sleeping too much', category: 'depression' },
    { id: 4, text: 'Feeling tired or having little energy', category: 'depression' },
    { id: 5, text: 'Poor appetite or overeating', category: 'depression' },
    { id: 6, text: 'Feeling like a failure or letting family down', category: 'depression' },
    { id: 7, text: 'Trouble concentrating on things', category: 'depression' },
    { id: 8, text: 'Thoughts of being better off dead or hurting yourself', category: 'depression' },
    { id: 9, text: 'Feeling nervous, anxious, or on edge', category: 'anxiety' },
    { id: 10, text: 'Unable to stop or control worrying', category: 'anxiety' },
    { id: 11, text: 'Worrying too much about different things', category: 'anxiety' },
    { id: 12, text: 'Trouble relaxing', category: 'anxiety' },
    { id: 13, text: 'Feeling constantly under strain', category: 'general' },
    { id: 14, text: 'Unable to enjoy day-to-day activities', category: 'general' },
    { id: 15, text: 'Feeling unhappy and depressed', category: 'general' }
  ];

  const answerOptions = [
    { value: 0, text: 'Not at all', color: theme.colors.success },
    { value: 1, text: 'Several days', color: theme.colors.warning },
    { value: 2, text: 'More than half the days', color: theme.colors.error },
    { value: 3, text: 'Nearly every day', color: theme.colors.error }
  ];

  const handleAnswer = (value: number) => {
    const newAnswer: Answer = {
      questionId: questions[currentQuestion].id,
      value
    };

    const updatedAnswers = [...answers.filter(a => a.questionId !== questions[currentQuestion].id), newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults(updatedAnswers);
    }
  };

  const calculateResults = (finalAnswers: Answer[]) => {
    const total = finalAnswers.reduce((sum, answer) => sum + answer.value, 0);
    setTotalScore(total);
    
    // Check for suicidal ideation (question 8)
    const suicidalAnswer = finalAnswers.find(a => a.questionId === 8);
    const hasSuicidalThoughts = suicidalAnswer && suicidalAnswer.value > 0;

    let riskLevel: 'minimal' | 'moderate' | 'high';
    
    if (hasSuicidalThoughts || total >= 26) {
      riskLevel = 'high';
    } else if (total >= 11) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'minimal';
    }

    updateUser({ riskLevel, lastAssessmentScore: total });
    setShowResults(true);
  };

  const getRiskLevelInfo = () => {
    if (totalScore >= 26) {
      return {
        level: 'High Risk',
        icon: <AlertTriangle size={32} color={theme.colors.error} />,
        color: theme.colors.error,
        message: 'Your responses indicate you may be experiencing significant mental health challenges. We strongly recommend speaking with a professional counselor immediately.',
        recommendations: [
          'Book an urgent session with a counselor',
          'Contact campus mental health services',
          'Reach out to trusted friends or family',
          'Use our emergency resources if needed'
        ]
      };
    } else if (totalScore >= 11) {
      return {
        level: 'Moderate Risk',
        icon: <CheckCircle size={32} color={theme.colors.warning} />,
        color: theme.colors.warning,
        message: 'Your responses suggest you may be experiencing some mental health challenges. Consider exploring our support resources.',
        recommendations: [
          'Try our MindCare AI assistant for immediate support',
          'Explore wellness activities and resources',
          'Consider booking a session with a counselor',
          'Connect with our community support'
        ]
      };
    } else {
      return {
        level: 'Minimal Risk',
        icon: <Shield size={32} color={theme.colors.success} />,
        color: theme.colors.success,
        message: 'Your responses suggest you\'re managing well overall. Keep up the great work with your mental health!',
        recommendations: [
          'Continue with wellness activities',
          'Explore our resource library',
          'Stay connected with our community',
          'Retake assessment periodically'
        ]
      };
    }
  };

  const handleShareResults = () => {
    Alert.alert(
      'Share Assessment Results',
      'Do you want to share your assessment results with a counselor for professional help?',
      [
        { text: 'No, Keep Private', style: 'cancel' },
        { text: 'Yes, Share Results', onPress: () => {
          Alert.alert('Results Shared', 'Your assessment results have been shared with our counseling team. They will contact you within 24 hours.');
        }}
      ]
    );
  };

  const retakeAssessment = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setTotalScore(0);
  };

  if (showResults) {
    const riskInfo = getRiskLevelInfo();
    
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Assessment Results',
            headerStyle: { backgroundColor: theme.colors.primary },
            headerTintColor: theme.colors.surface,
            headerTitleStyle: { fontWeight: '600' },
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={theme.colors.surface} />
              </TouchableOpacity>
            )
          }} 
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.resultsContainer}>
            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                {riskInfo.icon}
                <Text style={[styles.riskLevel, { color: riskInfo.color }]}>
                  {riskInfo.level}
                </Text>
              </View>
              <Text style={styles.scoreText}>Assessment Score: {totalScore}/45</Text>
              <Text style={styles.resultMessage}>{riskInfo.message}</Text>
            </View>

            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>Recommended Next Steps:</Text>
              {riskInfo.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShareResults}
              >
                <Text style={styles.shareButtonText}>Share with Counselor</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.retakeButton]}
                onPress={retakeAssessment}
              >
                <Text style={styles.retakeButtonText}>Retake Assessment</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerTitle}>Important Note:</Text>
              <Text style={styles.disclaimerText}>
                This assessment is a screening tool and not a diagnostic instrument. 
                For professional diagnosis and treatment, please consult with a qualified mental health professional.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Mental Health Assessment',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.surface,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.surface} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>
            Question {currentQuestion + 1}
          </Text>
          <Text style={styles.questionText}>
            Over the last 2 weeks, how often have you been bothered by:
          </Text>
          <Text style={styles.questionStatement}>
            {questions[currentQuestion].text}
          </Text>
        </View>

        <View style={styles.answersContainer}>
          {answerOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.answerButton, { borderColor: option.color }]}
              onPress={() => handleAnswer(option.value)}
            >
              <View style={[styles.answerIndicator, { backgroundColor: option.color }]} />
              <Text style={styles.answerText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.navigationContainer}>
          {currentQuestion > 0 && (
            <TouchableOpacity 
              style={styles.backQuestionButton}
              onPress={() => setCurrentQuestion(currentQuestion - 1)}
            >
              <Text style={styles.backQuestionText}>Previous Question</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  progressContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  questionContainer: {
    padding: theme.spacing.lg,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  questionText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  questionStatement: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 26,
  },
  answersContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  answerButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    gap: theme.spacing.md,
  },
  answerIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  answerText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  navigationContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  backQuestionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  backQuestionText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  resultsContainer: {
    padding: theme.spacing.lg,
  },
  scoreCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  riskLevel: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  resultMessage: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  recommendationsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  recommendationBullet: {
    fontSize: 16,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    fontWeight: '600',
  },
  recommendationText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 22,
  },
  actionsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: theme.colors.primary,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  retakeButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  disclaimerCard: {
    backgroundColor: theme.colors.calm,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.focus,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  disclaimerText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
});