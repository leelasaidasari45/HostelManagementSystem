import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _isLoading = true;

  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    checkAuth();
  }

  Future<void> checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token');

      if (token != null) {
        final res = await ApiService.get('/api/auth/me');
        if (res.statusCode == 200) {
          _user = jsonDecode(res.body);
        } else {
          await logout();
        }
      }
    } catch (e) {
      _user = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> login(String email, String password) async {
    try {
      final res = await ApiService.post('/api/auth/login', {
        'email': email,
        'password': password,
      });

      final data = jsonDecode(res.body);

      if (res.statusCode == 200) {
        _user = data;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('access_token', data['token']);
        notifyListeners();
        return null;
      } else {
        return data['error'] ?? 'Login failed';
      }
    } catch (e) {
      return 'Connection error. Please try again.';
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    _user = null;
    notifyListeners();
  }
}
