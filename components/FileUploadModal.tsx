import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  TextInput 
} from 'react-native';
import { 
  Upload, 
  File, 
  Video, 
  Music, 
  X,
  Check
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import * as DocumentPicker from 'expo-document-picker';

interface FileUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (file: any, fileName: string) => void;
}

export default function FileUploadModal({ visible, onClose, onUpload }: FileUploadModalProps) {
  const [fileName, setFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileType, setFileType] = useState<'video' | 'audio' | 'pdf' | null>(null);

  const resetModal = () => {
    setFileName('');
    setSelectedFile(null);
    setFileType(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const selectFile = async (type: 'video' | 'audio' | 'pdf') => {
    if (!type || !type.trim()) {
      console.log('Invalid file type selected');
      return;
    }
    
    try {
      let documentTypes: string[] = [];
      
      switch (type) {
        case 'video':
          documentTypes = ['video/*'];
          break;
        case 'audio':
          documentTypes = ['audio/*'];
          break;
        case 'pdf':
          documentTypes = ['application/pdf'];
          break;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: documentTypes,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        setFileType(type);
        if (!fileName) {
          setFileName(file.name.split('.')[0]);
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      console.log('Failed to select file. Please try again.');
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !fileName.trim()) {
      console.log('Please select a file and enter a name.');
      return;
    }

    onUpload(selectedFile, fileName.trim());
    handleClose();
    console.log('File uploaded successfully!');
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'video':
        return <Video size={24} color={theme.colors.primary} />;
      case 'audio':
        return <Music size={24} color={theme.colors.success} />;
      case 'pdf':
        return <File size={24} color={theme.colors.error} />;
      default:
        return <Upload size={24} color={theme.colors.textSecondary} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload File</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* File Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>File Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter file name..."
              value={fileName}
              onChangeText={setFileName}
              maxLength={50}
            />
          </View>

          {/* File Type Selection */}
          <View style={styles.fileTypeSection}>
            <Text style={styles.inputLabel}>Select File Type</Text>
            <View style={styles.fileTypeGrid}>
              <TouchableOpacity 
                style={[
                  styles.fileTypeButton,
                  fileType === 'video' && styles.fileTypeButtonActive
                ]}
                onPress={() => selectFile('video')}
              >
                <Video size={32} color={fileType === 'video' ? theme.colors.surface : theme.colors.primary} />
                <Text style={[
                  styles.fileTypeText,
                  fileType === 'video' && styles.fileTypeTextActive
                ]}>
                  Video
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.fileTypeButton,
                  fileType === 'audio' && styles.fileTypeButtonActive
                ]}
                onPress={() => selectFile('audio')}
              >
                <Music size={32} color={fileType === 'audio' ? theme.colors.surface : theme.colors.success} />
                <Text style={[
                  styles.fileTypeText,
                  fileType === 'audio' && styles.fileTypeTextActive
                ]}>
                  Audio
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.fileTypeButton,
                  fileType === 'pdf' && styles.fileTypeButtonActive
                ]}
                onPress={() => selectFile('pdf')}
              >
                <File size={32} color={fileType === 'pdf' ? theme.colors.surface : theme.colors.error} />
                <Text style={[
                  styles.fileTypeText,
                  fileType === 'pdf' && styles.fileTypeTextActive
                ]}>
                  PDF
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected File Info */}
          {selectedFile && (
            <View style={styles.selectedFileSection}>
              <Text style={styles.inputLabel}>Selected File</Text>
              <View style={styles.selectedFileCard}>
                {getFileIcon()}
                <View style={styles.selectedFileInfo}>
                  <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                  <Text style={styles.selectedFileSize}>
                    {formatFileSize(selectedFile.size || 0)}
                  </Text>
                </View>
                <Check size={20} color={theme.colors.success} />
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.uploadButton,
                (!selectedFile || !fileName.trim()) && styles.uploadButtonDisabled
              ]}
              onPress={handleUpload}
              disabled={!selectedFile || !fileName.trim()}
            >
              <Upload size={16} color={theme.colors.surface} />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  fileTypeSection: {
    marginBottom: theme.spacing.lg,
  },
  fileTypeGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  fileTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  fileTypeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  fileTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  fileTypeTextActive: {
    color: theme.colors.surface,
  },
  selectedFileSection: {
    marginBottom: theme.spacing.lg,
  },
  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  selectedFileInfo: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  selectedFileSize: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
  },
  uploadButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});