import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MerchantFormData, MerchantFormErrors } from '../types/merchant';
import {
  validateStoreName,
  validateMerchantName,
  validatePhone,
  validateAddress,
  validatePinCode,
  validateInterest,
} from '../lib/validation';
import { buildSheetRow, submitToSheet } from '../services/sheetApi';
import './MerchantForm.css';

const INITIAL_FORM: MerchantFormData = {
  storeName: '',
  merchantName: '',
  phoneNumber: '',
  address: '',
  pinCode: '',
  location: '',
  latitude: null,
  longitude: null,
  interest: '',
  potentialProblems: '',
};

export default function MerchantForm() {
  const [form, setForm] = useState<MerchantFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<MerchantFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof MerchantFormData, boolean>>>({});

  const update = (field: keyof MerchantFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof MerchantFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string>('');

  const handleGetLocation = () => {
    setTouched((t) => ({ ...t, location: true }));
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationStatus('error');
      return;
    }
    setLocationStatus('loading');
    setLocationError('');
    setErrors((prev) => ({ ...prev, location: undefined }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location: `${lat}, ${lng}`,
        }));
        setLocationStatus('success');
      },
      (err) => {
        setLocationStatus('error');
        if (err.code === 1) {
          setLocationError('Location permission denied. Please allow access in your browser settings.');
        } else if (err.code === 2) {
          setLocationError('Location unavailable. Please try again.');
        } else if (err.code === 3) {
          setLocationError('Request timed out. Please try again.');
        } else {
          setLocationError('Could not get your location. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const validate = (): boolean => {
    const next: MerchantFormErrors = {};
    const rStore = validateStoreName(form.storeName);
    if (!rStore.valid) next.storeName = rStore.message;
    const rMerchant = validateMerchantName(form.merchantName);
    if (!rMerchant.valid) next.merchantName = rMerchant.message;
    const rPhone = validatePhone(form.phoneNumber);
    if (!rPhone.valid) next.phoneNumber = rPhone.message;
    const rAddress = validateAddress(form.address);
    if (!rAddress.valid) next.address = rAddress.message;
    const rPin = validatePinCode(form.pinCode);
    if (!rPin.valid) next.pinCode = rPin.message;
    const hasLocation = form.latitude != null && form.longitude != null;
    if (!hasLocation) next.location = 'Please allow location access to get your coordinates';
    const rInterest = validateInterest(form.interest);
    if (!rInterest.valid) next.interest = rInterest.message;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const navigate = useNavigate();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({
      storeName: true,
      merchantName: true,
      phoneNumber: true,
      address: true,
      pinCode: true,
      location: true,
      interest: true,
    });
    if (!validate()) return;
    setSubmitStatus('sending');
    setSubmitError('');
    const row = buildSheetRow(form);
    const result = await submitToSheet(row);
    if (result.ok) {
      setSubmitStatus('done');
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } else {
      setSubmitStatus('error');
      setSubmitError(result.error || 'Failed to submit. Check your connection and sheet URL.');
    }
  };

  const showError = (field: keyof MerchantFormErrors) => touched[field] && errors[field];

  return (
    <div className="merchant-form-page">
      <div className="merchant-form-card">
        <h1 className="merchant-form-title">Merchant Info</h1>
        <p className="merchant-form-subtitle">Tell us about your store. All fields are required except potential problems.</p>

        <form onSubmit={handleSubmit} className="merchant-form" noValidate>
          <div className="form-group">
            <label htmlFor="storeName">Merchant Store Name <span className="required">*</span></label>
            <input
              id="storeName"
              type="text"
              value={form.storeName}
              onChange={(e) => update('storeName', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, storeName: true }))}
              placeholder="e.g. Fresh Mart"
              className={showError('storeName') ? 'input-error' : ''}
              autoComplete="organization"
            />
            {showError('storeName') && <span className="error-msg">{errors.storeName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="merchantName">Merchant Name <span className="required">*</span></label>
            <input
              id="merchantName"
              type="text"
              value={form.merchantName}
              onChange={(e) => update('merchantName', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, merchantName: true }))}
              placeholder="Your full name"
              className={showError('merchantName') ? 'input-error' : ''}
              autoComplete="name"
            />
            {showError('merchantName') && <span className="error-msg">{errors.merchantName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number <span className="required">*</span></label>
            <input
              id="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => update('phoneNumber', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, phoneNumber: true }))}
              placeholder="10 digit mobile number"
              className={showError('phoneNumber') ? 'input-error' : ''}
              autoComplete="tel"
            />
            {showError('phoneNumber') && <span className="error-msg">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address <span className="required">*</span></label>
            <textarea
              id="address"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, address: true }))}
              placeholder="Street, area, city"
              rows={2}
              className={showError('address') ? 'input-error' : ''}
              autoComplete="street-address"
            />
            {showError('address') && <span className="error-msg">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pinCode">Pin Code <span className="required">*</span></label>
              <input
                id="pinCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={form.pinCode}
                onChange={(e) => update('pinCode', e.target.value.replace(/\D/g, ''))}
                onBlur={() => setTouched((t) => ({ ...t, pinCode: true }))}
                placeholder="6 digits"
                className={showError('pinCode') ? 'input-error' : ''}
                autoComplete="postal-code"
              />
              {showError('pinCode') && <span className="error-msg">{errors.pinCode}</span>}
            </div>
            <div className="form-group form-group-location">
              <label>Location <span className="required">*</span></label>
              <p className="location-hint">We use your device location to get latitude and longitude.</p>
              <button
                type="button"
                className="location-btn"
                onClick={handleGetLocation}
                disabled={locationStatus === 'loading'}
              >
                {locationStatus === 'loading' ? 'Getting location…' : locationStatus === 'success' ? 'Location captured' : 'Allow & get store location'}
              </button>
              {locationStatus === 'success' && (
                <p className="location-coords">
                  Latitude: {form.latitude?.toFixed(6)}, Longitude: {form.longitude?.toFixed(6)}
                </p>
              )}
              {locationStatus === 'error' && <span className="error-msg">{locationError}</span>}
              {showError('location') && <span className="error-msg">{errors.location}</span>}
            </div>
          </div>

          <div className="form-group form-group-radio">
            <span className="label-block">Interested or Not interested? <span className="required">*</span></span>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="interest"
                  value="interested"
                  checked={form.interest === 'interested'}
                  onChange={(e) => update('interest', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, interest: true }))}
                />
                <span className="radio-label">Interested</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="interest"
                  value="not-interested"
                  checked={form.interest === 'not-interested'}
                  onChange={(e) => update('interest', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, interest: true }))}
                />
                <span className="radio-label">Not interested</span>
              </label>
            </div>
            {showError('interest') && <span className="error-msg">{errors.interest}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="potentialProblems">Potential problems faced by the merchants <span className="optional">(optional)</span></label>
            <textarea
              id="potentialProblems"
              value={form.potentialProblems}
              onChange={(e) => update('potentialProblems', e.target.value)}
              placeholder="Any challenges or issues you face..."
              rows={3}
              autoComplete="off"
            />
          </div>

          {submitStatus === 'error' && (
            <p className="error-msg submit-error">{submitError}</p>
          )}
          {submitStatus === 'done' && (
            <p className="submit-success">Submitted! Redirecting to home…</p>
          )}
          <button
            type="submit"
            className="submit-btn"
            disabled={submitStatus === 'sending'}
          >
            {submitStatus === 'sending' ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
