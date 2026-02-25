import React from 'react';
import { 
  ScrollView, 
  ScrollViewProps, 
  Platform,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

type NativeScrollViewProps = ScrollViewProps;
type KeyboardAwareProps = KeyboardAwareScrollViewProps;
type KeyboardAvoidingProps = KeyboardAvoidingViewProps;

type BaseProps = {
  children: React.ReactNode;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  contentContainerStyle?: NativeScrollViewProps['contentContainerStyle'];
  style?: NativeScrollViewProps['style'];
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  refreshControl?: React.ReactElement;
  onRefresh?: () => void;
  testID?: string;
};

type PlatformProps = BaseProps & 
  (NativeScrollViewProps & KeyboardAwareProps & KeyboardAvoidingProps);

export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = Platform.OS === 'web' ? 'handled' : 'always',
  contentContainerStyle,
  style,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  refreshControl,
  onRefresh,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  testID = 'keyboard-scroll-view',
  ...props
}: PlatformProps) {
  const insets = useSafeAreaInsets();

  // Web: Native ScrollView with keyboard handling
  if (Platform.OS === 'web') {
    return (
      <ScrollView
        testID={testID}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={[
          styles.webContent,
          contentContainerStyle,
          { paddingBottom: insets.bottom + 20 },
        ]}
        style={[styles.webScroll, style]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        refreshControl={refreshControl}
        onRefresh={onRefresh}
        nestedScrollEnabled
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  // iOS: KeyboardAwareScrollView (best keyboard handling)
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAwareScrollView
        testID={testID}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={[
          styles.iosContent,
          contentContainerStyle,
          { paddingBottom: insets.bottom + 32 },
        ]}
        style={[styles.iosScroll, style]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        refreshControl={refreshControl}
        enableOnAndroid={false}
        viewIsInsideTabBar={false}
        extraScrollHeight={20}
        enableAutomaticScroll
        {...props}
      >
        {children}
      </KeyboardAwareScrollView>
    );
  }

  // Android: KeyboardAvoidingView + ScrollView (stable)
  return (
    <KeyboardAvoidingView
      testID={testID}
      behavior={behavior}
      keyboardVerticalOffset={insets.top + 20}
      style={styles.androidKeyboardView}
    >
      <ScrollView
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={[
          styles.androidContent,
          contentContainerStyle,
          { paddingBottom: insets.bottom + 40 },
        ]}
        style={[styles.androidScroll, style]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        refreshControl={refreshControl}
        onRefresh={onRefresh}
        nestedScrollEnabled
        keyboardDismissMode="on-drag"
        {...props}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Quick wrappers for common patterns
export const KeyboardAwareScreen = React.memo(KeyboardAwareScrollViewCompat);
export const KeyboardScrollView = React.memo(KeyboardAwareScrollViewCompat);

// Hook for manual keyboard handling
export function useKeyboardScroll() {
  const insets = useSafeAreaInsets();
  
  return {
    bottomPadding: insets.bottom + 32,
    keyboardOffset: Platform.OS === 'ios' ? 20 : insets.top + 20,
    isWeb: Platform.OS === 'web',
  };
}

const styles = StyleSheet.create({
  // Web
  webScroll: {
    flex: 1,
  },
  webContent: {
    flexGrow: 1,
    paddingTop: 20,
  },

  // iOS  
  iosScroll: {
    flex: 1,
  },
  iosContent: {
    flexGrow: 1,
  },

  // Android
  androidKeyboardView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  androidScroll: {
    flex: 1,
  },
  androidContent: {
    flexGrow: 1,
  },
});
