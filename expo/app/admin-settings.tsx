import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Settings, 
  Phone, 
  Plus, 
  Edit3, 
  Trash2, 
  Save,
  X,
  Shield,
  AlertTriangle
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { emergencyContacts, type EmergencyContact } from '@/data/resources';

export default function AdminSettingsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => 
    emergencyContacts.map(contact => ({
      ...contact,
      type: contact.type as 'crisis' | 'support'
    }))
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
    type: 'support' as 'crisis' | 'support',
    isNational: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      description: '',
      type: 'support',
      isNational: false
    });
  };

  const handleAddContact = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      description: formData.description.trim(),
      type: formData.type,
      isNational: formData.isNational
    };

    setContacts(prev => [...prev, newContact]);
    setShowAddModal(false);
    resetForm();
    Alert.alert('Success', 'Emergency contact added successfully');
  };

  const handleEditContact = () => {
    if (!editingContact || !formData.name.trim() || !formData.phone.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const updatedContact: EmergencyContact = {
      ...editingContact,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      description: formData.description.trim(),
      type: formData.type,
      isNational: formData.isNational
    };

    setContacts(prev => prev.map(contact => 
      contact.id === editingContact.id ? updatedContact : contact
    ));
    
    setShowEditModal(false);
    setEditingContact(null);
    resetForm();
    console.log('Success: Emergency contact updated successfully');
  };

  const handleDeleteContact = (contactId: string) => {
    if (!contactId?.trim()) return;
    const contact = contacts.find(c => c.id === contactId.trim());
    if (contact?.isNational) {
      console.log('Cannot Delete: National helplines cannot be deleted for safety reasons.');
      return;
    }

    // In a real app, you would show a confirmation modal here
    setContacts(prev => prev.filter(contact => contact.id !== contactId.trim()));
    console.log('Success: Emergency contact deleted successfully');
  };

  const openEditModal = (contact: EmergencyContact) => {
    if (!contact?.id?.trim()) return;
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      description: contact.description,
      type: contact.type,
      isNational: contact.isNational || false
    });
    setShowEditModal(true);
  };

  const renderContactCard = (contact: EmergencyContact) => (
    <View key={contact.id} style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <View style={styles.contactTitleRow}>
            <Text style={styles.contactName}>{contact.name}</Text>
            {contact.isNational && (
              <View style={styles.nationalBadge}>
                <Shield size={12} color={theme.colors.primary} />
                <Text style={styles.nationalBadgeText}>National</Text>
              </View>
            )}
          </View>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
          <Text style={styles.contactDescription}>{contact.description}</Text>
          <View style={styles.contactType}>
            <AlertTriangle 
              size={14} 
              color={contact.type === 'crisis' ? theme.colors.error : theme.colors.warning} 
            />
            <Text style={[
              styles.contactTypeText,
              { color: contact.type === 'crisis' ? theme.colors.error : theme.colors.warning }
            ]}>
              {contact.type === 'crisis' ? 'Crisis Support' : 'General Support'}
            </Text>
          </View>
        </View>
        
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(contact)}
          >
            <Edit3 size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          
          {!contact.isNational && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteContact(contact.id)}
            >
              <Trash2 size={16} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderModal = (isEdit: boolean) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (isEdit) {
          setShowEditModal(false);
          setEditingContact(null);
        } else {
          setShowAddModal(false);
        }
        resetForm();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEdit ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setEditingContact(null);
                } else {
                  setShowAddModal(false);
                }
                resetForm();
              }}
            >
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter contact name"
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={100}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter description"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.type === 'crisis' && styles.typeButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type: 'crisis' }))}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.type === 'crisis' && styles.typeButtonTextActive
                  ]}>
                    Crisis Support
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.type === 'support' && styles.typeButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type: 'support' }))}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.type === 'support' && styles.typeButtonTextActive
                  ]}>
                    General Support
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormData(prev => ({ ...prev, isNational: !prev.isNational }))}
              >
                <View style={[styles.checkbox, formData.isNational && styles.checkboxActive]}>
                  {formData.isNational && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>National Helpline</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setEditingContact(null);
                } else {
                  setShowAddModal(false);
                }
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={isEdit ? handleEditContact : handleAddContact}
            >
              <Save size={16} color={theme.colors.surface} />
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Update' : 'Add'} Contact
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Helpline Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Settings size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Emergency Helplines</Text>
            </View>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={16} color={theme.colors.surface} />
              <Text style={styles.addButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionDescription}>
            Manage emergency helplines and support contacts. National helplines are protected and cannot be deleted.
          </Text>

          <View style={styles.contactsList}>
            {contacts.map(renderContactCard)}
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Important Information</Text>
          <View style={styles.infoCard}>
            <Shield size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                • National helplines (NIMHANS, iCall) are pre-loaded and protected
              </Text>
              <Text style={styles.infoText}>
                • Changes will be reflected across all user profiles immediately
              </Text>
              <Text style={styles.infoText}>
                • Crisis support contacts are prioritized in emergency situations
              </Text>
              <Text style={styles.infoText}>
                • AI system automatically flags harmful content and shows these contacts
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderModal(false)}
      {renderModal(true)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  contactsList: {
    gap: theme.spacing.md,
  },
  contactCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  nationalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  nationalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  contactPhone: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  contactDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  contactType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  contactTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: theme.colors.error + '10',
  },
  infoSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalForm: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  formInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  typeButtonTextActive: {
    color: theme.colors.surface,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});