import 'package:flutter/material.dart';

class AppColors {
  // Brand
  static const Color primary = Color(0xFF25D366);
  
  // WhatsApp Light mode
  static const Color accentLight = Color(0xFF008069);
  static const Color backgroundLight = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color foregroundLight = Color(0xFF111B21);
  static const Color borderLight = Color(0xFFE9EDEF);
  static const Color mutedLight = Color(0xFF667781);

  // WhatsApp Dark mode
  static const Color accentDark = Color(0xFF00A884);
  static const Color backgroundDark = Color(0xFF111B21);
  static const Color cardDark = Color(0xFF202C33);
  static const Color foregroundDark = Color(0xFFE9EDEF);
  static const Color borderDark = Color(0xFF2A3942);
  static const Color mutedDark = Color(0xFF8696A0);

  // Gradients (shared)
  static const Color blueStart = Color(0xFF60A5FA);
  static const Color blueEnd = Color(0xFF6366F1);
  static const Color greenStart = Color(0xFF4ADE80);
  static const Color greenEnd = Color(0xFF14B8A6);
  static const Color redStart = Color(0xFFF87171);
  static const Color redEnd = Color(0xFFF43F5E);
  static const Color yellowStart = Color(0xFFFACC15);
  static const Color yellowEnd = Color(0xFFF59E0B);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.backgroundLight,
      primaryColor: AppColors.primary,
      colorScheme: const ColorScheme.light(
        primary: AppColors.accentLight,
        onPrimary: Colors.white,
        secondary: AppColors.primary,
        surface: AppColors.cardLight,
        onSurface: AppColors.foregroundLight,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.cardLight,
        foregroundColor: AppColors.foregroundLight,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color: AppColors.cardLight,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderLight),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.accentLight,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.cardLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.accentLight, width: 1.8),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.backgroundDark,
      primaryColor: AppColors.primary,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accentDark,
        onPrimary: AppColors.backgroundDark,
        secondary: AppColors.primary,
        surface: AppColors.cardDark,
        onSurface: AppColors.foregroundDark,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.backgroundDark,
        foregroundColor: AppColors.foregroundDark,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color: AppColors.cardDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderDark),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.accentDark,
          foregroundColor: AppColors.backgroundDark,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.cardDark,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.accentDark, width: 1.8),
        ),
      ),
    );
  }
}
