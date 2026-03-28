// Appointments API Service
import { apiService } from './api';
import type { Appointment } from '@/types/user';

export interface CreateAppointmentRequest {
  counselorId: string;
  date: string;
  time: string;
  type?: 'individual' | 'group' | 'crisis';
  notes?: string;
}

export interface UpdateAppointmentRequest {
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled';
  notes?: string;
}

class AppointmentService {
  async getAppointments() {
    return apiService.get<Appointment[]>('/appointments');
  }

  async bookAppointment(appointmentData: CreateAppointmentRequest) {
    return apiService.post<Appointment>('/appointments', appointmentData);
  }

  async updateAppointment(appointmentId: string, updateData: UpdateAppointmentRequest) {
    return apiService.put<Appointment>(`/appointments/${appointmentId}`, updateData);
  }

  async cancelAppointment(appointmentId: string) {
    return this.updateAppointment(appointmentId, { status: 'cancelled' });
  }

  async approveAppointment(appointmentId: string, notes?: string) {
    return this.updateAppointment(appointmentId, { status: 'approved', notes });
  }

  async declineAppointment(appointmentId: string, notes?: string) {
    return this.updateAppointment(appointmentId, { status: 'declined', notes });
  }

  async completeAppointment(appointmentId: string, notes?: string) {
    return this.updateAppointment(appointmentId, { status: 'completed', notes });
  }

  // Get appointments by status
  async getAppointmentsByStatus(status: Appointment['status']) {
    const response = await this.getAppointments();
    if (response.success && response.data) {
      return response.data.filter(appointment => appointment.status === status);
    }
    return [];
  }

  // Get upcoming appointments
  async getUpcomingAppointments() {
    const response = await this.getAppointments();
    if (response.success && response.data) {
      const now = new Date();
      return response.data.filter(appointment => {
        const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
        return appointmentDate > now && appointment.status === 'approved';
      });
    }
    return [];
  }
}

export const appointmentService = new AppointmentService();