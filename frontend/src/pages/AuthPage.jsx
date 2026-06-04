import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Moon, Sun, CheckCircle2, Phone, Zap, Shield, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import './AuthPage.css';

const languages = [
  { id: 'en', native: 'English', english: 'English' },
  { id: 'hi', native: 'हिंदी', english: 'Hindi' },
  { id: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { id: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { id: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { id: 'te', native: 'తెలుగు', english: 'Telugu' },
  { id: 'bn', native: 'বাংলা', english: 'Bangla' },
  { id: 'mr', native: 'मराठी', english: 'Marathi' },
];

const translations = {
  en: {
    chooseLang: "Choose Language",
    langNote: "Note: Some translations are still in progress. We appreciate your patience as we work to improve the app's language support.",
    continue: "Continue",
    loginWithEmail: "Login with email",
    emailPlaceholder: "name@company.com",
    byContinuing: "By continuing you agree to our",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    newToEasyPg: "New to easyPG?",
    signUp: "Sign Up",
    welcomeBack: "Welcome Back",
    enterPasswordFor: "Enter password for",
    enterPassword: "Enter password",
    logIn: "Log In",
    forgotPassword: "Forgot password?",
    changeEmail: "Change email",
    createAccount: "Create Account",
    joinEasyPgToday: "Join easyPG today",
    yourFullName: "Your Full Name",
    createPassword: "Create Password",
    confirmPassword: "Confirm Password",
    register: "Register",
    backToLogin: "Back to Login",
    validEmailError: "Please enter a valid email address",
    accountNotFoundError: "Account not found. Please Sign Up!",
    enterNameError: "Please enter your name",
    passwordLengthError: "Password must be at least 6 characters",
    passwordMatchError: "Passwords do not match",
    accountCreatedSuccess: "Account created successfully!",
    welcomeBackSuccess: "Welcome back!",
    mobileNumber: "Mobile Number",
    enterPhoneError: "Please enter your mobile number"
  },
  hi: {
    chooseLang: "भाषा चुनें",
    langNote: "नोट: कुछ अनुवाद अभी जारी हैं। ऐप के भाषा समर्थन को बेहतर बनाने में आपके सहयोग की हम सराहना करते हैं।",
    continue: "जारी रखें",
    loginWithEmail: "ईमेल से लॉग इन करें",
    emailPlaceholder: "name@company.com",
    byContinuing: "जारी रखने पर आप हमारी शर्तों से सहमत होते हैं",
    termsOfService: "सेवा की शर्तें",
    privacyPolicy: "गोपनीयता नीति",
    newToEasyPg: "easyPG पर नए हैं?",
    signUp: "साइन अप करें",
    welcomeBack: "आपका स्वागत है",
    enterPasswordFor: "पासवर्ड दर्ज करें:",
    enterPassword: "पासवर्ड दर्ज करें",
    logIn: "लॉग इन करें",
    forgotPassword: "पासवर्ड भूल गए?",
    changeEmail: "ईमेल बदलें",
    createAccount: "खाता बनाएं",
    joinEasyPgToday: "आज ही easyPG से जुड़ें",
    yourFullName: "आपका पूरा नाम",
    createPassword: "पासवर्ड बनाएं",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    register: "पंजीकरण करें",
    backToLogin: "लॉग इन पर वापस जाएं",
    validEmailError: "कृपया एक वैध ईमेल पता दर्ज करें",
    accountNotFoundError: "खाता नहीं मिला। कृपया साइन अप करें!",
    enterNameError: "कृपया अपना नाम दर्ज करें",
    passwordLengthError: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
    passwordMatchError: "पासवर्ड मेल नहीं खाते",
    accountCreatedSuccess: "खाता सफलतापूर्वक बन गया!",
    welcomeBackSuccess: "आपका स्वागत है!",
    mobileNumber: "मोबाइल नंबर",
    enterPhoneError: "कृपया अपना मोबाइल नंबर दर्ज करें"
  },
  gu: {
    chooseLang: "ભાષા પસંદ કરો",
    langNote: "નોંધ: કેટલાક અનુવાદો હજુ ચાલુ છે. એપ્લિકેશનના ભાષા સપોર્ટने સુધારવામાં તમારા સહકારની અમે પ્રશંસા કરીએ છીએ.",
    continue: "ચાલુ રાખો",
    loginWithEmail: "ઈમેલ દ્વારા લોગઇન કરો",
    emailPlaceholder: "name@company.com",
    byContinuing: "ચાલુ રાખીને તમે અમારી શરતો સાથે સંમત થાઓ છો",
    termsOfService: "સેવાની શરતો",
    privacyPolicy: "ગોપનીયતા નીતિ",
    newToEasyPg: "easyPG પર નવા છો?",
    signUp: "સાઇન અપ કરો",
    welcomeBack: "આપનું સ્વાગત છે",
    enterPasswordFor: "માટે પાसવર્ડ દાખલ કરો:",
    enterPassword: "પાસવર્ડ દાખल કરો",
    logIn: "લોગ ઇન કરો",
    forgotPassword: "પાસવર્ડ ભૂલી ગયા છો?",
    changeEmail: "ઈમેલ બદલો",
    createAccount: "ખાતું બનાવો",
    joinEasyPgToday: "આજે જ easyPG માં જોડાઓ",
    yourFullName: "તમારું આખું નામ",
    createPassword: "પાસવર્ડ બનાવો",
    confirmPassword: "પાસવર્ડની પુષ્ટિ કરો",
    register: "રજીસ્ટર કરો",
    backToLogin: "લોગિન પર પાછા જાઓ",
    validEmailError: "કૃપા કરીને માન્ય ઈમેલ સરનામું દાખલ કરો",
    accountNotFoundError: "ખાતું મળ્યું નથી. કૃપા કરીને સાઇન અપ કરો!",
    enterNameError: "કૃપા કરીને તમારું નામ દાખલ કરો",
    passwordLengthError: "પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરોનો હોવો જોઈએ",
    passwordMatchError: "પાસવર્ડ મેળ ખાતા નથી",
    accountCreatedSuccess: "ખાતું સફળતાપૂર્વક બનાવવામાં આવ્યું છે!",
    welcomeBackSuccess: "આપનું સ્વાગત છે!",
    mobileNumber: "મોબાઇલ નંબર",
    enterPhoneError: "કૃપા કરીને તમારો મોબાઇલ નંબર દાખલ કરો"
  },
  kn: {
    chooseLang: "ಭಾಷೆಯನ್ನು ಆರಿಸಿ",
    langNote: "ಗಮನಿಸಿ: ಕೆಲವು ಅನುವಾದಗಳು ಇನ್ನೂ ಪ್ರಗತಿಯಲ್ಲಿವೆ. ಅಪ್ಲಿಕೇಶನ್‌ನ ಭಾಷಾ ಬೆಂಬಲವನ್ನು ಸುಧಾರಿಸಲು ನಿಮ್ಮ ಸಹಕಾರಕ್ಕೆ ನಾವು ಧನ್ಯವಾದಗಳು ತಿಳಿಸುತ್ತೇವೆ.",
    continue: "ಮುಂದುವರಿಯಿರಿ",
    loginWithEmail: "ಇಮೇಲ್ ಮೂಲಕ ಲಾಗ್ ಇನ್ ಮಾಡಿ",
    emailPlaceholder: "name@company.com",
    byContinuing: "ಮುಂದುವರಿಯುವ ಮೂಲಕ ನೀವು ನಮ್ಮ ನಿಯಮಗಳನ್ನು ಒಪ್ಪುತ್ತೀರಿ",
    termsOfService: "ಸೇವಾ ನಿಯಮಗಳು",
    privacyPolicy: "ಗೌಪ್ಯತಾ ನೀತಿ",
    newToEasyPg: "easyPG ಗೆ ಹೊಸಬರೇ?",
    signUp: "ಸೈನ್ ಅಪ್ ಮಾಡಿ",
    welcomeBack: "ಸ್ವಾಗತ",
    enterPasswordFor: "ರ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ:",
    enterPassword: "ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    logIn: "ಲಾಗ್ ಇನ್",
    forgotPassword: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
    changeEmail: "ಇಮೇಲ್ ಬದಲಾಯಿಸಿ",
    createAccount: "ಖಾತೆ ರಚಿಸಿ",
    joinEasyPgToday: "ಇಂದೇ easyPG ಸೇರಿಕೊಳ್ಳಿ",
    yourFullName: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು",
    createPassword: "ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ",
    confirmPassword: "ಪಾಸ್‌ವರ್ಡ್ ಖಚಿತಪಡಿಸಿ",
    register: "ನೋಂದಾಯಿಸಿ",
    backToLogin: "ಲಾಗ್ ಇನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    validEmailError: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ",
    accountNotFoundError: "ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸೈನ್ ಅಪ್ ಮಾಡಿ!",
    enterNameError: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    passwordLengthError: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು",
    passwordMatchError: "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ",
    accountCreatedSuccess: "ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ರಚನೆಯಾಗಿದೆ!",
    welcomeBackSuccess: "ಸ್ವಾಗತ!",
    mobileNumber: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    enterPhoneError: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ"
  },
  ta: {
    chooseLang: "மொழியைத் தேர்ந்தெடுக்கவும்",
    langNote: "குறிப்பு: சில மொழிபெயர்ப்புகள் இன்னும் செயல்பாட்டில் உள்ளன. பயன்பாட்டின் மொழி ஆதரவை மேம்படுத்த உங்கள் ஒத்துழைப்பை நாங்கள் பாராட்டுகிறோம்.",
    continue: "தொடரவும்",
    loginWithEmail: "மின்னஞ்சல் மூலம் உள்நுழைக",
    emailPlaceholder: "name@company.com",
    byContinuing: "தொடர்வதன் மூலம் எங்கள் விதிமுறைகளை ஏற்கிறீர்கள்",
    termsOfService: "சேவை விதிமுறைகள்",
    privacyPolicy: "தனியுரிமைக் கொள்கை",
    newToEasyPg: "easyPG-க்கு புதியவரா?",
    signUp: "பதிவு செய்க",
    welcomeBack: "நல்வரவு",
    enterPasswordFor: "மின்னஞ்சலுக்கான கடவுச்சொல்லை உள்ளிடவும்:",
    enterPassword: "கடவுச்சொல்லை உள்ளிடவும்",
    logIn: "உள்நுழைக",
    forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
    changeEmail: "மின்னஞ்சலை மாற்றவும்",
    createAccount: "கணக்கை உருவாக்கவும்",
    joinEasyPgToday: "இன்றே easyPG-யில் இணையுங்கள்",
    yourFullName: "உங்கள் முழு பெயர்",
    createPassword: "கடவுச்சொல்லை உருவாக்கவும்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    register: "பதிவு செய்யவும்",
    backToLogin: "உள்நுழைவுக்குத் திரும்புக",
    validEmailError: "தயவுசெய்து சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்",
    accountNotFoundError: "கணக்கு இல்லை. தயவுசெய்து பதிவு செய்யவும்!",
    enterNameError: "தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்",
    passwordLengthError: "கடவுச்சொல் குறைந்தது 6 எழுத்துக்களைக் கொண்டிருக்க வேண்டும்",
    passwordMatchError: "கடவுச்சொற்கள் பொருந்தவில்லை",
    accountCreatedSuccess: "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!",
    welcomeBackSuccess: "வரவேற்கிறோம்!",
    mobileNumber: "கைப்பேசி எண்",
    enterPhoneError: "தயவுசெய்து உங்கள் கைப்பேசி எண்ணை உள்ளிடவும்"
  },
  te: {
    chooseLang: "భాషను ఎంచుకోండి",
    langNote: "గమనిక: కొన్ని అనువాదాలు ఇంకా పురోగతిలో ఉన్నాయి. యాప్ భాషా మద్దతును మెరుగుపరచడంలో మీ సహకారానికి ధన్యవాదాలు.",
    continue: "కొనసాగించు",
    loginWithEmail: "ఈమెయిల్ ద్వారా లాగిన్ అవ్వండి",
    emailPlaceholder: "name@company.com",
    byContinuing: "కొనసాగడం ద్వారా మీరు మా నిబంధనలను అంగీకరిస్తున్నారు",
    termsOfService: "సేవా నిబంధనలు",
    privacyPolicy: "గోప్యతా విధానం",
    newToEasyPg: "easyPGకి కొత్తవారా?",
    signUp: "సైన్ అప్ చేయండి",
    welcomeBack: "స్వాగతం",
    enterPasswordFor: "పాస్‌వర్డ్ నమోదు చేయండి:",
    enterPassword: "పాస్‌వర్డ్ నమోదు చేయండి",
    logIn: "లాగిన్ అవ్వండి",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
    changeEmail: "ఈమెయిల్ మార్చండి",
    createAccount: "ఖాతాను సృష్టించండి",
    joinEasyPgToday: "ఈరోజే easyPG లో చేరండి",
    yourFullName: "మీ పూర్తి పేరు",
    createPassword: "పాస్‌వర్డ్ సృష్టించండి",
    confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    register: "రిజిస్టర్ చేసుకోండి",
    backToLogin: "లాగిన్‌కి తిరిగి వెళ్ళండి",
    validEmailError: "దయచేసి చెల్లుబాటు అయ్యే ఈమెయిల్ చిరునామాను నమోదు చేయండి",
    accountNotFoundError: "ఖాతా కనుగొనబడలేదు. దయచేసి సైన్ అప్ చేయండి!",
    enterNameError: "దయచేసి మీ పేరును నమోదు చేయండి",
    passwordLengthError: "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి",
    passwordMatchError: "పాస్‌వర్డ్‌లు సరిపోలలేదు",
    accountCreatedSuccess: "ఖాతా విజయవంతంగా సృష్టించబడింది!",
    welcomeBackSuccess: "స్వాగతం!",
    mobileNumber: "మొబైల్ సంఖ్య",
    enterPhoneError: "దయచేసి మీ మొబైల్ సంఖ్యను నమోదు చేయండి"
  },
  bn: {
    chooseLang: "ভাষা নির্বাচন করুন",
    langNote: "দ্রষ্টব্য: কিছু অনুবাদ এখনও প্রক্রিয়াধীন রয়েছে। অ্যাপের ভাষা সমর্থন উন্নত করতে আপনার সহযোগিতার আমরা প্রশংসা করি।",
    continue: "এগিয়ে যান",
    loginWithEmail: "ইমেল দিয়ে লগইন করুন",
    emailPlaceholder: "name@company.com",
    byContinuing: "এগিয়ে যাওয়ার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মত হন",
    termsOfService: "পরিষেবার শর্তাবলী",
    privacyPolicy: "গোপনীয়তা নীতি",
    newToEasyPg: "easyPG-তে নতুন?",
    signUp: "সাইন আপ করুন",
    welcomeBack: "স্বাগতম",
    enterPasswordFor: "পাসওয়ার্ড লিখুন:",
    enterPassword: "পাসওয়ার্ড লিখুন",
    logIn: "লগইন করুন",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    changeEmail: "ইমেল পরিবর্তন করুন",
    createAccount: "অ্যাকাউন্ট তৈরি করুন",
    joinEasyPgToday: "আজই easyPG-তে যোগ দিন",
    yourFullName: "আপনার পুরো নাম",
    createPassword: "পাসওয়ার্ড তৈরি করুন",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    register: "নিবন্ধন করুন",
    backToLogin: "লগইনে ফিরে যান",
    validEmailError: "দয়া করে একটি বৈধ ইমেল ঠিকানা লিখুন",
    accountNotFoundError: "অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে সাইন আপ করুন!",
    enterNameError: "দয়া করে আপনার নাম লিখুন",
    passwordLengthError: "পাসওয়ার্ডটি কমপক্ষে ৬টি অক্ষরের হতে হবে",
    passwordMatchError: "পাসওয়ার্ড মেলেনি",
    accountCreatedSuccess: "অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে!",
    welcomeBackSuccess: "স্বাগতম!",
    mobileNumber: "মোবাইল নম্বর",
    enterPhoneError: "অনুগ্রহ করে আপনার মোবাইল নম্বর লিখুন"
  },
  mr: {
    chooseLang: "भाषा निवडा",
    langNote: "टीप: काही भाषांतरे अद्याप प्रगतीपथावर आहेत. ॲपचे भाषा समर्थन सुधारण्यात आपल्या सहकार्याबद्दल आम्ही आभारी आहोत.",
    continue: "पुढील",
    loginWithEmail: "ईमेल द्वारे लॉग इन करा",
    emailPlaceholder: "name@company.com",
    byContinuing: "पुढील सुरू ठेवून आपण आमच्या अटींशी सहमत आहात",
    termsOfService: "सेवा अटी",
    privacyPolicy: "गोपनीयता धोरण",
    newToEasyPg: "easyPG वर नवीन आहात?",
    signUp: "साइन अप करा",
    welcomeBack: "सुस्वागतम",
    enterPasswordFor: "पासवर्ड प्रविष्ट करा:",
    enterPassword: "पासवर्ड प्रविष्ट करा",
    logIn: "लॉग इन करा",
    forgotPassword: "पासवर्ड विसरलात?",
    changeEmail: "ईमेल बदला",
    createAccount: "खाते तयार करा",
    joinEasyPgToday: "आजच easyPG मध्ये सामील व्हा",
    yourFullName: "आपले पूर्ण नाव",
    createPassword: "पासवर्ड तयार करा",
    confirmPassword: "पासवर्डची पुष्टी करा",
    register: "नोंदणी करा",
    backToLogin: "लॉगिनवर परत जा",
    validEmailError: "कृपया वैध ईमेल पत्ता प्रविष्ट करा",
    accountNotFoundError: "खाते सापडले नाही. कृपया साइन अप करा!",
    enterNameError: "कृपया आपले नाव प्रविष्ट करा",
    passwordLengthError: "पासवर्ड किमान ६ अक्षरांचा असावा",
    passwordMatchError: "पासवर्ड जुळत नाहीत",
    accountCreatedSuccess: "खाते यशस्वीरित्या तयार झाले आहे!",
    welcomeBackSuccess: "सुस्वागतम!",
    mobileNumber: "मोबाईल नंबर",
    enterPhoneError: "कृपया आपला मोबाईल नंबर प्रविष्ट करा"
  }
};

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginContext, user: authUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Layout and Flow States
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem('easyPG_lang') || 'en';
  });
  const [mobileStep, setMobileStep] = useState(() => {
    const savedLang = localStorage.getItem('easyPG_lang');
    return savedLang ? 'email' : 'language';
  });
  const [emailInput, setEmailInput] = useState('');

  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ phone: '', email: '', password: '', confirmPassword: '' });

  const t = translations[selectedLang] || translations.en;

  // Handle mobile detection resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (authUser) navigate(authUser.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
  }, [authUser, navigate]);

  useEffect(() => { setIsLogin(location.pathname !== '/register'); }, [location.pathname]);

  const handleToggle = (mode) => {
    setIsLogin(mode === 'login');
    navigate(mode === 'login' ? '/login' : '/register');
  };

  const parseRequestError = (err, fallbackMessage) => {
    if (!err) return fallbackMessage;
    const errorMsg = err?.message?.toLowerCase() || '';
    if (
      errorMsg.includes('failed to fetch') || 
      errorMsg.includes('network error') || 
      err?.code === 'ECONNABORTED'
    ) {
      return 'Unable to connect to the server. The backend might be starting up (Render free tier cold starts can take ~50s) or you are offline. Please wait a moment and try again.';
    }
    return err.response?.data?.details || err.response?.data?.error || err.message || fallbackMessage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/api/auth/login', { email: formData.email, password: formData.password });
        loginContext(res.data);
        toast.success('Welcome back!');
        navigate(res.data.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
      } else {
        if (!formData.phone.trim()) throw new Error(t.enterPhoneError);
        if (formData.password !== formData.confirmPassword) throw new Error(t.passwordMatchError);
        const res = await api.post('/api/auth/register', { 
          name: formData.phone, 
          phone: formData.phone,
          email: formData.email, 
          password: formData.password 
        });
        loginContext(res.data);
        toast.success('Account created!');
        navigate('/select-role');
      }
    } catch (err) {
      toast.error(parseRequestError(err, 'Authentication failed'));
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw error;
    } catch (err) { toast.error(err.message || 'Google login failed'); }
  };

  const isNative = Capacitor.isNativePlatform();

  // ==================== MOBILE (NATIVE & WEB) LAYOUT ====================
  if (isNative || isMobile) {
    return (
      <div className={`auth-page-v2 ${!isDarkMode ? 'light' : ''}`} style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base, #ffffff)',
        padding: '2.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: "'Inter', sans-serif",
        position: 'relative'
      }}>
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-muted, #e5e7eb)',
            color: 'var(--text-bright, #111827)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            width: 36,
            height: 36,
          }}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Logo */}
        <div style={{ marginTop: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <img src="/logo.png" alt="easyPG" style={{ height: 100, objectFit: 'contain' }} />
        </div>

        {/* Headings */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-bright, #111827)', margin: '0 0 0.4rem 0' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim, #6b7280)', margin: 0 }}>
            {isLogin ? 'Login to your account' : 'Sign up to get started'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400 }}>
          
          {!isLogin && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright, #111827)', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <input 
                type="text"
                placeholder="Enter your name"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-muted, #f3f4f6)',
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  fontSize: '0.9rem',
                  color: 'var(--text-bright, #111827)',
                  outline: 'none',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright, #111827)', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input 
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--border-muted, #f3f4f6)',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                fontSize: '0.9rem',
                color: 'var(--text-bright, #111827)',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright, #111827)', marginBottom: '0.5rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 2.5rem 0.875rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-muted, #f3f4f6)',
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  fontSize: '0.9rem',
                  color: 'var(--text-bright, #111827)',
                  outline: 'none',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright, #111827)', marginBottom: '0.5rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required={!isLogin}
                  style={{
                    width: '100%',
                    padding: '0.875rem 2.5rem 0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-muted, #f3f4f6)',
                    backgroundColor: 'var(--bg-surface, #ffffff)',
                    fontSize: '0.9rem',
                    color: 'var(--text-bright, #111827)',
                    outline: 'none',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              backgroundColor: '#f97316',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.25)'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
          
          {isLogin && (
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <Link to="/forgot-password" style={{ color: '#f97316', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '3rem' }}>
            <span style={{ color: 'var(--text-dim, #6b7280)', fontSize: '0.85rem' }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button 
              type="button"
              onClick={() => handleToggle(isLogin ? 'register' : 'login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#f97316',
                fontWeight: 600,
                fontSize: '0.85rem',
                marginLeft: '0.35rem',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==================== DESKTOP AUTH LAYOUT ====================
  return (
    <div className={`auth-page-v2 ${!isDarkMode ? 'light' : ''}`}>
      {/* Theme Toggle Floating Button */}
      <button 
        className="theme-btn"
        onClick={toggleTheme}
        type="button"
        title="Toggle theme"
        style={{ position: 'absolute', top: '2rem', right: '2.5rem', zIndex: 100 }}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="auth-wrapper">

        {/* Main Content */}
        <div className="auth-container-v2">
          {/* Left Decorative Section */}
          <div className="auth-decoration">
            <div className="decoration-card">
              <div className="decoration-badge">
                <span className="decoration-badge-dot"></span>
                Trusted by 500+ Hostel Owners
              </div>
              <div className="decoration-header">
                <h2>Modern Living,<br/>Simplified.</h2>
                <p>The all-in-one management suite for property owners and happy tenants across India.</p>
              </div>
              <div className="decoration-features">
                <div className="feature-item">
                  <div className="feature-check"><Zap size={20} /></div>
                  <div>
                    <h4>Smart Automation</h4>
                    <p>Automate billing, reminders & reports effortlessly.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-check"><Shield size={20} /></div>
                  <div>
                    <h4>Bank-Grade Security</h4>
                    <p>End-to-end encryption for all your sensitive data.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-check"><BarChart3 size={20} /></div>
                  <div>
                    <h4>Real-Time Analytics</h4>
                    <p>Powerful dashboards to track occupancy and revenue.</p>
                  </div>
                </div>
              </div>
              <div className="deco-stats">
                <div className="deco-stat">
                  <span className="deco-stat-value">500+</span>
                  <span className="deco-stat-label">Hostels</span>
                </div>
                <div className="deco-stat">
                  <span className="deco-stat-value">10K+</span>
                  <span className="deco-stat-label">Tenants</span>
                </div>
                <div className="deco-stat">
                  <span className="deco-stat-value">99.9%</span>
                  <span className="deco-stat-label">Uptime</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="auth-form-section">
            <div className="form-container">
              {/* Form Header */}
              <div className="form-header">
                <h1>{isLogin ? 'Welcome back 👋' : 'Get started free'}</h1>
                <p>{isLogin ? 'Sign in to access your dashboard' : 'Create your account and start managing today'}</p>
              </div>

              {/* Toggle Buttons */}
              <div className="form-tabs">
                <button 
                  className={`tab-btn ${isLogin ? 'active' : ''}`}
                  onClick={() => handleToggle('login')}
                  type="button"
                >
                  Sign In
                </button>
                <button 
                  className={`tab-btn ${!isLogin ? 'active' : ''}`}
                  onClick={() => handleToggle('register')}
                  type="button"
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form-v2">
                {!isLogin && (
                  <div className="form-group-v2">
                    <label>{t.mobileNumber}</label>
                    <div className="input-field">
                      <Phone size={20} />
                      <input 
                        type="tel" 
                        placeholder="e.g. 9876543210"
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}
                
                <div className="form-group-v2">
                  <label>Email Address</label>
                  <div className="input-field">
                    <Mail size={20} />
                    <input 
                      type="email" 
                      placeholder="name@company.com"
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                      required
                    />
                  </div>
                </div>

                <div className="form-group-v2">
                  <label>Password</label>
                  <div className="input-field">
                    <Lock size={20} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••"
                      value={formData.password} 
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                      required
                    />
                    <button 
                      type="button" 
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="form-group-v2">
                    <label>Confirm Password</label>
                    <div className="input-field">
                      <Lock size={20} />
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        placeholder="••••••••"
                        value={formData.confirmPassword} 
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                        required={!isLogin}
                      />
                      <button 
                        type="button" 
                        className="eye-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="forgot-row">
                    <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="pulse-opacity">
                      {isLogin ? 'Signing in' : 'Creating account'}
                      <span className="pulsing-dot-container">
                        <span className="pulsing-dot"></span>
                        <span className="pulsing-dot"></span>
                        <span className="pulsing-dot"></span>
                      </span>
                    </span>
                  ) : (
                    <>{isLogin ? '→ Continue to Dashboard' : '→ Create My Account'}</>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="divider">
                <span>or continue with</span>
              </div>

              {/* Google Button */}
              <button 
                onClick={handleGoogleLogin} 
                className="google-btn-v2"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Account
              </button>

              {/* Footer */}
              <p className="form-footer">
                {isLogin ? "New to easyPG?" : 'Already a member?'}{' '}
                <button 
                  type="button" 
                  onClick={() => handleToggle(isLogin ? 'register' : 'login')} 
                  className="link-btn"
                >
                  {isLogin ? 'Sign up for free' : 'Sign in here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

