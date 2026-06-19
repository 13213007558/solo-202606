import axios from 'axios'
import { Activity, Donation, CreateActivityPayload, DonatePayload } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const activityApi = {
  getActivities: (): Promise<Activity[]> => {
    return api.get('/activities').then(res => res.data)
  },

  getActivity: (id: string): Promise<Activity> => {
    return api.get(`/activity/${id}`).then(res => res.data)
  },

  createActivity: (payload: CreateActivityPayload): Promise<Activity> => {
    return api.post('/activity', payload).then(res => res.data)
  }
}

export const donationApi = {
  getDonations: (activityId: string): Promise<Donation[]> => {
    return api.get(`/activity/${activityId}/donations`).then(res => res.data)
  },

  donate: (activityId: string, payload: DonatePayload): Promise<Donation> => {
    return api.post(`/activity/${activityId}/donate`, payload).then(res => res.data)
  }
}
