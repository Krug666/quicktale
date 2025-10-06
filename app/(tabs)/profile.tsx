
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import DataService from '@/services/DataService';
import { User } from '@/types';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const dataService = DataService.getInstance();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await dataService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.log('Error loading user:', error);
    }
  };

  const handleSwitchUserType = async () => {
    if (!user) return;

    const newType = user.type === 'reader' ? 'writer' : 'reader';
    const typeLabel = newType === 'writer' ? 'Writer' : 'Reader';

    Alert.alert(
      `Switch to ${typeLabel}`,
      `Are you sure you want to switch to ${typeLabel} mode?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            await dataService.updateUserType(newType);
            setUser({ ...user, type: newType });
            Alert.alert('Success', `Switched to ${typeLabel} mode!`);
          },
        },
      ]
    );
  };

  const renderProfileOption = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    showArrow: boolean = true
  ) => (
    <TouchableOpacity
      style={[commonStyles.card, { marginHorizontal: 16 }]}
      onPress={onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.optionIcon}>
          <IconSymbol name={icon as any} size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
            {title}
          </Text>
          <Text style={commonStyles.textSecondary}>{subtitle}</Text>
        </View>
        {showArrow && (
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile',
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            Platform.OS !== 'ios' && { paddingBottom: 100 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Section */}
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <IconSymbol name="person.fill" size={40} color={colors.card} />
            </View>
            <Text style={[commonStyles.title, { fontSize: 24, marginTop: 16 }]}>
              {user?.name || 'Demo User'}
            </Text>
            <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
              {user?.email || 'user@example.com'}
            </Text>
            <View style={styles.userTypeContainer}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                {user?.type === 'writer' ? 'Writer' : 'Reader'} Account
              </Text>
            </View>
          </View>

          {/* Account Type Switch */}
          <View style={[commonStyles.card, { marginHorizontal: 16, backgroundColor: colors.accent }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <IconSymbol name="arrow.triangle.2.circlepath" size={24} color={colors.primary} />
              <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8 }]}>
                Account Type
              </Text>
            </View>
            <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
              {user?.type === 'reader' 
                ? 'Switch to Writer to publish your books'
                : 'Switch to Reader to focus on reading'
              }
            </Text>
            <TouchableOpacity
              style={[commonStyles.button, { backgroundColor: colors.primary }]}
              onPress={handleSwitchUserType}
            >
              <Text style={commonStyles.buttonText}>
                Switch to {user?.type === 'reader' ? 'Writer' : 'Reader'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Writer Dashboard */}
          {user?.type === 'writer' && (
            renderProfileOption(
              'pencil.and.outline',
              'Writer Dashboard',
              'Manage your published books',
              () => router.push('/writer-dashboard')
            )
          )}

          {/* Library Stats */}
          {renderProfileOption(
            'chart.bar.fill',
            'Reading Statistics',
            'View your reading progress and stats',
            () => Alert.alert('Coming Soon', 'Reading statistics coming soon!')
          )}

          {/* Notes & Highlights */}
          {renderProfileOption(
            'note.text',
            'Notes & Highlights',
            'View all your saved notes and highlights',
            () => router.push('/notes-highlights')
          )}

          {/* Language Settings */}
          {renderProfileOption(
            'globe',
            'Language Preferences',
            'Set your preferred reading languages',
            () => Alert.alert('Coming Soon', 'Language preferences coming soon!')
          )}

          {/* Subscription */}
          {renderProfileOption(
            'crown.fill',
            'Subscription',
            user?.subscription?.isActive ? 'Manage your subscription' : 'Subscribe for unlimited access',
            () => Alert.alert('Coming Soon', 'Subscription management coming soon!')
          )}

          {/* Settings */}
          {renderProfileOption(
            'gear',
            'Settings',
            'App preferences and account settings',
            () => Alert.alert('Coming Soon', 'Settings coming soon!')
          )}

          {/* Help & Support */}
          {renderProfileOption(
            'questionmark.circle',
            'Help & Support',
            'Get help and contact support',
            () => Alert.alert('Coming Soon', 'Help & Support coming soon!')
          )}

          {/* About */}
          {renderProfileOption(
            'info.circle',
            'About',
            'App version and information',
            () => Alert.alert('About', 'Multilingual Book Library v1.0.0'),
            false
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = {
  scrollContainer: {
    paddingVertical: 16,
  },
  userSection: {
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  userTypeContainer: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
};
