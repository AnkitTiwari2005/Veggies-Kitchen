import { Geolocation } from '@capacitor/geolocation';
import { isNative } from '../hooks/useCapacitor';

export const checkPermission = async () => {
  try {
    if (isNative) {
      const status = await Geolocation.checkPermissions();
      return status.location;
    } else {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state;
    }
  } catch (e) {
    console.error('Check permission error', e);
    return 'prompt';
  }
};

export const requestPermission = async () => {
  try {
    if (isNative) {
      const status = await Geolocation.requestPermissions();
      return status.location;
    } else {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          () => resolve('denied')
        );
      });
    }
  } catch (e) {
    console.error('Request permission error', e);
    return 'denied';
  }
};

export const getCurrentPosition = async () => {
  try {
    const permission = await checkPermission();
    if (permission === 'denied') {
      throw new Error('Location permission denied');
    }
    
    if (isNative) {
      const coordinates = await Geolocation.getCurrentPosition();
      return {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy,
      };
    } else {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
          (err) => reject(new Error(err.code === 1 ? 'Location permission denied' : err.message)),
          { enableHighAccuracy: true }
        );
      });
    }
  } catch (error) {
    if (error.message.includes('permission denied')) {
      throw new Error('Location permission denied');
    }
    throw error;
  }
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    return {
      street: data.locality || '',
      city: data.city || data.principalSubdivision || '',
      state: data.principalSubdivision || '',
      pincode: data.postcode || '',
      fullAddress: `${data.locality ? data.locality + ', ' : ''}${data.city ? data.city + ', ' : ''}${data.principalSubdivision || ''}`,
    };
  } catch (error) {
    console.error('Reverse geocode error', error);
    throw error;
  }
};

export const getAddressFromLocation = async () => {
  const position = await getCurrentPosition();
  const address = await reverseGeocode(position.lat, position.lng);
  return { ...position, ...address };
};
