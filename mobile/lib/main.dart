import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EasyPGApp());
}

class EasyPGApp extends StatelessWidget {
  const EasyPGApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'easyPG',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: const Color(0xFF4F46E5),
      ),
      home: const SplashScreen(),
    );
  }
}
