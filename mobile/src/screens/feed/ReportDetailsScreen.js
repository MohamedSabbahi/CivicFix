import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
    Alert, Modal, Linking, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import supabase from '../../lib/supabaseClient';

export default function ReportDetailScreen({ route, navigation }) {
    // We store the report in state so we can instantly update the UI after an edit
    const [currentReport, setCurrentReport] = useState(route.params.report);

    // Auth & Permissions
    const { userInfo } = useContext(AuthContext);
    const currentUserId = userInfo?.id || userInfo?.user?.id;
    const isOwner = currentUserId === currentReport.userId;

    // Departments / interventions
    const [departments, setDepartments] = useState([]);

    // Comments State
    const [comments, setComments] = useState([]);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Realtime status banner
    const [statusBanner, setStatusBanner] = useState(null);
    const bannerAnim = useRef(new Animated.Value(-60)).current;

    const showBanner = (newStatus) => {
        setStatusBanner(newStatus);
        Animated.sequence([
            Animated.spring(bannerAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
            Animated.delay(3000),
            Animated.timing(bannerAnim, { toValue: -60, duration: 300, useNativeDriver: true }),
        ]).start(() => setStatusBanner(null));
    };

    useEffect(() => {
        if (!supabase || !currentReport?.id) return;
        const channel = supabase
            .channel(`report-status-${currentReport.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'CivicIssue',
                filter: `id=eq.${currentReport.id}`,
            }, (payload) => {
                const { status, resolvedAt } = payload.new;
                setCurrentReport(prev => ({ ...prev, status, resolvedAt }));
                showBanner(status);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [currentReport?.id]);

    // Menu & Edit State
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editTitle, setEditTitle] = useState(currentReport.title);
    const [editDescription, setEditDescription] = useState(currentReport.description);
    const [isUpdating, setIsUpdating] = useState(false);

    // Format the date nicely
    const dateOptions = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    const formattedDate = new Date(currentReport.createdAt).toLocaleDateString('en-GB', dateOptions);

    // Dynamic styling for the Status badge
    const getStatusStyle = (status) => {
        switch(status) {
            case 'RESOLVED': return { bg: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-400', icon: 'check-circle' };
            case 'IN_PROGRESS': return { bg: 'bg-orange-500/20 border-orange-500/30', text: 'text-orange-400', icon: 'build' };
            default: return { bg: 'bg-red-500/20 border-red-500/30', text: 'text-red-400', icon: 'pending' };
        }
    };
    const statusStyle = getStatusStyle(currentReport.status);

    // ── API CALLS ──

    const fetchComments = async () => {
        try {
            const response = await api.get(`/reports/${currentReport.id}/comments`);
            setComments(response.data.data);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get(`/reports/${currentReport.id}/interventions`);
            setDepartments(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    useEffect(() => {
        fetchComments();
        fetchDepartments();
    }, []);

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            await api.post(`/reports/${currentReport.id}/comments`, { content: newComment.trim() });
            setNewComment('');
            fetchComments();
        } catch (error) {
            Alert.alert("Cannot post comment", error.response?.data?.message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateReport = async () => {
        if (!editTitle.trim()) {
            Alert.alert("Missing Title", "The report title cannot be empty.");
            return;
        }

        setIsUpdating(true);
        try {
            const response = await api.put(`/reports/${currentReport.id}`, {
                title: editTitle.trim(),
                description: editDescription.trim(),
            });
            
            // Update the local state so the screen reflects the changes immediately
            setCurrentReport(response.data.data);
            setIsEditModalVisible(false); // Close the edit modal
        } catch (error) {
            console.error(error);
            Alert.alert("Update Failed", "Could not save your changes. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const openNativeMap = () => {
        const lat = currentReport.latitude || 35.5889;
        const lng = currentReport.longitude || -5.3626;
        const label = encodeURIComponent(currentReport.title || "CivicFix Report");

        // Apple Maps strictly uses the maps: scheme, Android uses geo:
        const url = Platform.select({
            ios: `maps:${lat},${lng}?q=${label}&ll=${lat},${lng}`,
            android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`
        });

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert("Error", "Could not open the maps application.");
            }
        });
    };

    // ── Tracking Timeline ─────────────────────────────────────────────────────
    const ISSUE_STEPS = [
        { key: 'PENDING',     label: 'Pending',     icon: 'schedule',      color: '#f97316' },
        { key: 'IN_PROGRESS', label: 'In Progress', icon: 'local-shipping', color: '#3b82f6' },
        { key: 'RESOLVED',    label: 'Resolved',    icon: 'check-circle',  color: '#22c55e' },
    ];
    const DEPT_STEPS = [
        { key: 'PENDING',     label: 'Pending',     icon: 'schedule',     color: '#f59e0b' },
        { key: 'IN_PROGRESS', label: 'In Progress', icon: 'build',        color: '#3b82f6' },
        { key: 'COMPLETED',   label: 'Completed',   icon: 'check-circle', color: '#22c55e' },
    ];
    const getStepIndex = (steps, status = '') =>
        Math.max(0, steps.findIndex(s => s.key === status));

    const StepTimeline = ({ steps, currentIndex }) => (
        <View className="flex-row items-center">
            {steps.map((step, index) => {
                const isActive    = index === currentIndex;
                const isDone      = index < currentIndex;
                const isLast      = index === steps.length - 1;
                const activeColor = step.color;
                const dimColor    = 'rgba(255,255,255,0.15)';

                return (
                    <React.Fragment key={step.key}>
                        <View className="items-center" style={{ flex: isLast ? 0 : 1 }}>
                            <View style={{
                                width: 38, height: 38, borderRadius: 19,
                                borderWidth: 2,
                                borderColor: index <= currentIndex ? activeColor : dimColor,
                                backgroundColor: index <= currentIndex ? `${activeColor}20` : 'rgba(255,255,255,0.04)',
                                alignItems: 'center', justifyContent: 'center',
                                shadowColor: isActive ? activeColor : 'transparent',
                                shadowRadius: isActive ? 10 : 0, shadowOpacity: isActive ? 0.8 : 0, elevation: isActive ? 6 : 0,
                            }}>
                                <MaterialIcons
                                    name={step.icon}
                                    size={17}
                                    color={index <= currentIndex ? activeColor : 'rgba(255,255,255,0.3)'}
                                />
                            </View>
                            <Text style={{
                                marginTop: 6, fontSize: 10, fontWeight: '600', textAlign: 'center',
                                color: isActive ? activeColor : isDone ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
                            }}>
                                {step.label}
                            </Text>
                        </View>
                        {!isLast && (
                            <View style={{
                                flex: 1, height: 2, marginBottom: 16, marginHorizontal: 4,
                                backgroundColor: isDone ? activeColor : dimColor,
                                borderRadius: 1,
                            }} />
                        )}
                    </React.Fragment>
                );
            })}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-background-dark"
        >
            {/* ── Realtime Status Banner ── */}
            {statusBanner && (
                <Animated.View
                    style={{ transform: [{ translateY: bannerAnim }] }}
                    className="absolute top-0 left-0 right-0 z-50 items-center pt-14 pb-3 px-4"
                    pointerEvents="none"
                >
                    <View className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full border shadow-lg ${
                        statusBanner === 'RESOLVED'    ? 'bg-emerald-950 border-emerald-500/40' :
                        statusBanner === 'IN_PROGRESS' ? 'bg-orange-950 border-orange-500/40'  :
                                                         'bg-slate-900 border-slate-600'
                    }`}>
                        <MaterialIcons
                            name={statusBanner === 'RESOLVED' ? 'check-circle' : statusBanner === 'IN_PROGRESS' ? 'build' : 'pending'}
                            size={15}
                            color={statusBanner === 'RESOLVED' ? '#34d399' : statusBanner === 'IN_PROGRESS' ? '#fb923c' : '#94a3b8'}
                        />
                        <Text className={`text-xs font-bold tracking-wide ${
                            statusBanner === 'RESOLVED' ? 'text-emerald-400' :
                            statusBanner === 'IN_PROGRESS' ? 'text-orange-400' : 'text-slate-300'
                        }`}>
                            Status updated · {statusBanner === 'IN_PROGRESS' ? 'In Progress' : statusBanner.charAt(0) + statusBanner.slice(1).toLowerCase()}
                        </Text>
                    </View>
                </Animated.View>
            )}

            {/* ── Floating Header ── */}
            <View className="absolute top-12 left-4 right-4 z-20 flex-row justify-between">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    className="w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/10"
                >
                    <MaterialIcons name="arrow-back-ios" size={20} color="#fff" style={{ marginLeft: 6 }} />
                </TouchableOpacity>

                {isOwner ? (
                    <TouchableOpacity 
                        onPress={() => setIsMenuVisible(true)}
                        className="w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/10"
                    >
                        <MaterialIcons name="more-vert" size={24} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <View className="w-10 h-10" />
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                
                {/* Hero Image Section */}
                <View className="w-full h-[380px] bg-slate-800">
                    {currentReport.photoUrl ? (
                        <Image 
                            source={{ uri: currentReport.photoUrl }} 
                            className="w-full h-full"
                            style={{ width: '100%', height: '100%', backgroundColor: '#1e293b' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <MaterialIcons name="image" size={64} color="#334155" />
                        </View>
                    )}
                    <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f172a] to-transparent" />
                </View>

                {/* Main Content Container */}
                <View className="-mt-10 px-5 pb-8 z-10 bg-[#0f172a] rounded-t-3xl min-h-[500px]">
                    
                    <View className="flex-row justify-between items-start pt-6">
                        <View className={`flex-row items-center px-3 py-1 rounded-full border ${statusStyle.bg}`}>
                            <MaterialIcons name={statusStyle.icon} size={14} color={statusStyle.text.replace('text-', '')} />
                            <Text className={`text-xs font-bold ml-1.5 ${statusStyle.text}`}>
                                {currentReport.status === 'IN_PROGRESS' ? 'IN PROGRESS' : (currentReport.status || 'PENDING')}
                            </Text>
                        </View>
                        
                        <View className="bg-[#1e293b] px-3 py-1.5 rounded-full border border-slate-700">
                            <Text className="text-slate-300 text-xs font-bold">{currentReport.category?.name || 'General'}</Text>
                        </View>
                    </View>

                    <Text className="text-2xl font-bold text-white mt-4 leading-tight">
                        {currentReport.title}
                    </Text>
                    
                    <View className="flex-row items-center gap-2 text-sm mt-2 mb-5">
                        <MaterialIcons name="schedule" size={16} color="#64748b" />
                        <Text className="text-slate-400 text-sm">{formattedDate}</Text>
                        <Text className="text-slate-600">•</Text>
                        <MaterialIcons name="person" size={16} color="#64748b" />
                        <Text className="text-slate-400 text-sm">{currentReport.user?.name || 'Citizen'}</Text>
                    </View>

                    <View className="bg-[#1e293b] p-4 rounded-2xl border border-slate-800 shadow-sm">
                        <Text className="text-slate-300 text-base leading-relaxed">
                            {currentReport.description || "No detailed description provided for this issue."}
                        </Text>
                        
                       <View className="mt-5 w-full h-28 rounded-xl overflow-hidden border border-slate-700 relative">
                            {/* NEW: OpenStreetMap Static Thumbnail via WebView */}
                            <WebView
                                style={{ flex: 1 }}
                                scrollEnabled={false}
                                pointerEvents="none" 
                                source={{
                                    html: `
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                                        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                                        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                                        <style>
                                            body { padding: 0; margin: 0; background-color: #0f172a; }
                                            #map { height: 100vh; width: 100vw; }
                                            .leaflet-control-zoom, .leaflet-control-attribution { display: none; } 
                                            .leaflet-layer { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
                                        </style>
                                    </head>
                                    <body>
                                        <div id="map"></div>
                                        <script>
                                            var map = L.map('map', { zoomControl: false, dragging: false, scrollWheelZoom: false }).setView([${currentReport.latitude || 35.5889}, ${currentReport.longitude || -5.3626}], 15);
                                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
                                            L.marker([${currentReport.latitude || 35.5889}, ${currentReport.longitude || -5.3626}]).addTo(map);
                                        </script>
                                    </body>
                                    </html>
                                    `
                                }}
                            />
                            
                            {/* The "Open in Maps" Overlay Button */}
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                onPress={openNativeMap}
                                className="absolute inset-0 bg-black/30 items-center justify-center z-10"
                            >
                                <View className="bg-[#0f172a] px-4 py-2 rounded-full flex-row items-center shadow-lg border border-slate-700">
                                    <MaterialIcons name="map" size={16} color="#3b82f6" />
                                    <Text className="text-sm font-bold text-white ml-2">Open in Native Maps</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── Tracking Status ── */}
                    <View className="bg-[#1e293b] rounded-2xl border border-slate-800 p-4 mt-4">
                        <View className="flex-row items-center gap-2 mb-4">
                            <View style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: '#3b82f6' }} />
                            <Text className="text-white font-bold text-sm">Tracking Status</Text>
                        </View>
                        <StepTimeline steps={ISSUE_STEPS} currentIndex={getStepIndex(ISSUE_STEPS, currentReport.status)} />

                        {departments.length > 0 && (
                            <View className="mt-5">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <View style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: '#8b5cf6' }} />
                                    <Text className="text-white font-bold text-sm">
                                        Department Work
                                        <Text className="text-slate-500 font-normal"> ({departments.length} assigned)</Text>
                                    </Text>
                                </View>
                                {departments.map((item) => (
                                    <View key={item.id} className="bg-slate-900/60 rounded-xl p-3 mb-2 border border-slate-700/50">
                                        <View className="flex-row justify-between items-center mb-3">
                                            <Text className="text-white text-xs font-semibold">{item.department?.name}</Text>
                                            <Text className="text-slate-500 text-xs">
                                                {new Date(item.assignedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </Text>
                                        </View>
                                        <StepTimeline steps={DEPT_STEPS} currentIndex={getStepIndex(DEPT_STEPS, item.status)} />
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    <View className="h-[1px] bg-slate-800 my-6" />

                    {/* Comments Section */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-5">
                            <Text className="text-lg font-bold text-white">Community Feedback</Text>
                            <Text className="text-xs font-bold text-slate-500">{comments.length} Comments</Text>
                        </View>

                        {isLoadingComments ? (
                            <ActivityIndicator color="#3b82f6" className="mt-4" />
                        ) : comments.length === 0 ? (
                            <Text className="text-slate-500 text-center mt-4">No comments yet. Be the first to reply!</Text>
                        ) : (
                            comments.map((comment) => (
                                <View key={comment.id} className="flex-row gap-3 mb-5">
                                    <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center border border-slate-700">
                                        <MaterialIcons name="person" size={20} color="#94a3b8" />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-baseline justify-between mb-1">
                                            <Text className="text-sm font-bold text-white">{comment.user?.name}</Text>
                                            <Text className="text-xs text-slate-500">
                                                {new Date(comment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </Text>
                                        </View>
                                        <View className="p-3 bg-[#1e293b] rounded-2xl rounded-tl-sm border border-slate-800">
                                            <Text className="text-slate-300 text-sm leading-5">
                                                {comment.text}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* ── Sticky Bottom Input ── */}
            <View className="bg-[#0f172a] border-t border-slate-800 p-4 pb-8">
                <View className="flex-row items-center gap-3">
                    <View className="flex-1 relative">
                        <TextInput
                            className="w-full bg-slate-900 border border-slate-700 rounded-full pl-5 pr-12 py-3 text-sm"
                            style={{ color: '#ffffff' }}
                            placeholder="Add a comment..."
                            placeholderTextColor="#64748b"
                            value={newComment}
                            onChangeText={setNewComment}
                            maxLength={500}
                        />
                        <TouchableOpacity 
                            onPress={handleSendComment}
                            disabled={isSubmitting || !newComment.trim()}
                            className={`absolute right-2 top-1.5 p-2 rounded-full ${newComment.trim() ? 'bg-blue-600' : 'bg-transparent'}`}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialIcons name="send" size={18} color={newComment.trim() ? "#fff" : "#64748b"} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* ── 3-Dot Options Bottom Sheet ── */}
            <Modal visible={isMenuVisible} transparent animationType="fade">
                <TouchableOpacity 
                    className="flex-1 bg-black/60 justify-end" 
                    activeOpacity={1} 
                    onPress={() => setIsMenuVisible(false)}
                >
                    <View className="bg-slate-900 rounded-t-3xl p-6 border-t border-slate-700 pb-10">
                        <View className="w-12 h-1.5 bg-slate-700 rounded-full self-center mb-6" />
                        
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 ml-1">Manage Report</Text>
                        
                        <TouchableOpacity 
                            className="flex-row items-center bg-[#1e293b] p-4 rounded-2xl mb-2 active:bg-slate-800"
                            onPress={() => {
                                setIsMenuVisible(false);
                                setIsEditModalVisible(true);
                            }}
                        >
                            <View className="w-10 h-10 bg-blue-500/10 rounded-full items-center justify-center mr-4">
                                <MaterialIcons name="edit" size={20} color="#60a5fa" />
                            </View>
                            <Text className="text-white font-bold text-base flex-1">Edit Details</Text>
                            <MaterialIcons name="chevron-right" size={24} color="#64748b" />
                        </TouchableOpacity>

                        <Text className="text-slate-500 text-xs text-center mt-4">
                            Note: Deleting reports requires city administrator access.
                        </Text>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ── Edit Report Modal ── */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/60">
                    <View className="bg-[#0f172a] rounded-t-3xl p-6 border-t border-slate-700 max-h-[85%] pb-10">
                        <View className="flex-row justify-between items-center mb-8 mt-2">
                            <Text className="text-white text-xl font-bold">Edit Report</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)} className="p-2 bg-slate-800 rounded-full active:bg-slate-700">
                                <MaterialIcons name="close" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 ml-1">Title</Text>
                        <TextInput
                            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 mb-6"
                            style={{ color: '#ffffff', fontSize: 16 }}
                            value={editTitle}
                            onChangeText={setEditTitle}
                            placeholder="Report Title"
                            placeholderTextColor="#64748b"
                        />

                        <Text className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2 ml-1">Description</Text>
                        <TextInput
                            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 h-32"
                            style={{ color: '#ffffff', fontSize: 16 }}
                            value={editDescription}
                            onChangeText={setEditDescription}
                            placeholder="Provide additional details..."
                            placeholderTextColor="#64748b"
                            multiline
                            textAlignVertical="top"
                        />

                        <TouchableOpacity 
                            onPress={handleUpdateReport}
                            disabled={isUpdating}
                            className={`py-4 rounded-full items-center mt-8 shadow-lg ${isUpdating ? 'bg-blue-800' : 'bg-blue-600 shadow-blue-500/30'}`}
                        >
                            {isUpdating ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </KeyboardAvoidingView>
    );
}