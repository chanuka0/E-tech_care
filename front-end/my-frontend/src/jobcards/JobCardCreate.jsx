
import { useState, useEffect, useRef } from 'react';
import { apiCall, API_ENDPOINTS } from '../services/api';
import { BrowserMultiFormatReader } from '@zxing/browser';

const JobCardCreate = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeviceBarcodeScanner, setShowDeviceBarcodeScanner] = useState(false);
  const [showOtherSerialScanner, setShowOtherSerialScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const deviceBarcodeVideoRef = useRef(null);
  const otherSerialVideoRef = useRef(null);
  const deviceBarcodeReaderRef = useRef(null);
  const otherSerialReaderRef = useRef(null);
  const [faults, setFaults] = useState([]);
  const [services, setServices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [allModelNumbers, setAllModelNumbers] = useState([]);
  const [filteredModelNumbers, setFilteredModelNumbers] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [deviceConditions, setDeviceConditions] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [regularCustomers, setRegularCustomers] = useState([]);

  // ✅ Customer search state
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const customerSearchRef = useRef(null);
  const customerDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    isRegularCustomer: false, customerId: '', customerName: '', customerPhone: '', customerEmail: '',
    deviceType: 'LAPTOP', brandId: '', modelId: '', modelNumberId: '', processorId: '',
    deviceConditionIds: [], faultDescription: '', notes: '', advancePayment: '', estimatedCost: '',
    deviceBarcode: '', deviceBarcodes: [], otherSerials: [], selectedFaults: [], selectedServices: [],
    oneDayService: false, withCharger: false,
  });
  const [currentOtherSerial, setCurrentOtherSerial] = useState({ serialType: 'IMEI', serialValue: '' });

  const deviceTypes = ['LAPTOP', 'DESKTOP', 'PRINTER', 'PROJECTOR', 'OTHER'];
  const serialTypes = ['RAM_01','RAM_02','RAM_03','RAM_04','HDD_01','HDD_02','SSD_01','SSD_02','ADAPTER','BATTERY'];
  const noProcessorTypes = ['PRINTER', 'PROJECTOR'];
  const hasProcessor = !noProcessorTypes.includes(formData.deviceType);

  // ✅ Filter customers as user types
  useEffect(() => {
    if (!customerSearchText.trim()) {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }
    const q = customerSearchText.toLowerCase();
    const results = regularCustomers.filter(c =>
      c.customerName?.toLowerCase().includes(q) ||
      c.phoneNumber?.toLowerCase().includes(q)
    );
    setFilteredCustomers(results);
    setShowCustomerDropdown(true);
  }, [customerSearchText, regularCustomers]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        customerSearchRef.current && !customerSearchRef.current.contains(e.target) &&
        customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)
      ) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Select a customer from dropdown
  const handleCustomerSearchSelect = (customer) => {
    const cId = customer.customerId || customer.id;
    setFormData(prev => ({
      ...prev,
      isRegularCustomer: true,
      customerId: cId,
      customerName: customer.customerName,
      customerPhone: customer.phoneNumber,
      customerEmail: customer.email || '',
      selectedServices: prev.selectedServices.map(s => ({
        ...s,
        effectivePrice: getServicePrice(s, true)
      }))
    }));
    setCustomerSearchText(customer.customerName);
    setShowCustomerDropdown(false);
    setError('');
    showSuccessMessage(`✅ ${customer.customerName} selected`);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.type !== 'textarea') {
        e.preventDefault(); e.stopPropagation();
        const el = document.activeElement;
        if (el?.name === 'deviceBarcode' && formData.deviceBarcode.trim()) addDeviceBarcode();
        else if (el?.name === 'serialValue' && currentOtherSerial.serialValue.trim()) addOtherSerial();
        return false;
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [formData.deviceBarcode, currentOtherSerial.serialValue]);

  useEffect(() => {
    let barcodeBuffer = ''; let lastKeyTime = 0; let timer = null;
    const handleBarcodeKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Enter') return;
      const now = Date.now();
      if (now - lastKeyTime > 100) barcodeBuffer = '';
      lastKeyTime = now;
      if (e.key.length === 1) barcodeBuffer += e.key;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { if (barcodeBuffer.length >= 3) handleScannedBarcode(barcodeBuffer); barcodeBuffer = ''; }, 50);
    };
    document.addEventListener('keydown', handleBarcodeKeyDown, true);
    return () => { document.removeEventListener('keydown', handleBarcodeKeyDown, true); if (timer) clearTimeout(timer); };
  }, []);

  const handleScannedBarcode = (barcode) => {
    setIsScanning(true);
    if (barcode.length >= 8 && barcode.length <= 20) {
      setFormData(prev => ({ ...prev, deviceBarcode: barcode }));
      setTimeout(() => { addDeviceBarcode(); setIsScanning(false); }, 100);
    }
    showScanningMessage(`Scanned: ${barcode}`);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (dataLoaded) return;
      try {
        const [faultsData, servicesData, brandsData, modelsData, modelNumbersData, processorsData, conditionsData, customersData] = await Promise.all([
          apiCall('/api/faults'), apiCall('/api/service-categories'), apiCall('/api/brands'),
          apiCall('/api/models'), apiCall('/api/model-numbers'), apiCall('/api/processors'),
          apiCall('/api/device-conditions'), apiCall('/api/customers/active')
        ]);
        if (isMounted) {
          setFaults((faultsData||[]).filter(i=>i.isActive));
          setServices((servicesData||[]).filter(i=>i.isActive));
          setBrands((brandsData||[]).filter(i=>i.isActive));
          setAllModels((modelsData||[]).filter(i=>i.isActive));
          setAllModelNumbers((modelNumbersData||[]).filter(i=>i.isActive));
          setProcessors((processorsData||[]).filter(i=>i.isActive));
          setDeviceConditions((conditionsData||[]).filter(i=>i.isActive));
          setRegularCustomers(customersData?.customers||[]);
          setDataLoaded(true);
        }
      } catch (err) { console.error(err); if (isMounted) setError('Failed to load form data'); }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [dataLoaded]);

  useEffect(() => {
    if (formData.brandId) {
      setFilteredModels(allModels.filter(m=>m.brand?.id===parseInt(formData.brandId)&&m.isActive));
      setFormData(prev=>({...prev,modelId:'',modelNumberId:''})); setFilteredModelNumbers([]);
    } else { setFilteredModels([]); setFormData(prev=>({...prev,modelId:'',modelNumberId:''})); setFilteredModelNumbers([]); }
  }, [formData.brandId, allModels]);

  useEffect(() => {
    if (formData.modelId) {
      setFilteredModelNumbers(allModelNumbers.filter(mn=>mn.model?.id===parseInt(formData.modelId)&&mn.isActive));
      setFormData(prev=>({...prev,modelNumberId:''}));
    } else { setFilteredModelNumbers([]); setFormData(prev=>({...prev,modelNumberId:''})); }
  }, [formData.modelId, allModelNumbers]);

  const getServicePrice = (service, isRegular) => {
    if (isRegular && service.specialServicePrice != null) return service.specialServicePrice;
    return service.servicePrice;
  };

  const handleRegularCustomerToggle = (e) => {
    if (e.target.checked) {
      setFormData(prev => ({
        ...prev,
        isRegularCustomer: true,
        selectedServices: prev.selectedServices.map(s => ({
          ...s,
          effectivePrice: getServicePrice(s, true)
        }))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        isRegularCustomer: false, customerId: '', customerName: '', customerPhone: '', customerEmail: '',
        selectedServices: prev.selectedServices.map(s => ({ ...s, effectivePrice: s.servicePrice }))
      }));
      setCustomerSearchText('');
      setShowCustomerDropdown(false);
    }
  };

  useEffect(() => {
    if (!showDeviceBarcodeScanner||!deviceBarcodeVideoRef.current) return;
    const r = new BrowserMultiFormatReader(); deviceBarcodeReaderRef.current = r;
    r.decodeFromVideoDevice(undefined,deviceBarcodeVideoRef.current,(result)=>{ if(result) handleDeviceBarcodeScan(result.getText()); });
    return () => { if(deviceBarcodeReaderRef.current){deviceBarcodeReaderRef.current.reset();deviceBarcodeReaderRef.current=null;} };
  }, [showDeviceBarcodeScanner]);

  useEffect(() => {
    if (!showOtherSerialScanner||!otherSerialVideoRef.current) return;
    const r = new BrowserMultiFormatReader(); otherSerialReaderRef.current = r;
    r.decodeFromVideoDevice(undefined,otherSerialVideoRef.current,(result)=>{ if(result) handleOtherSerialScan(result.getText()); });
    return () => { if(otherSerialReaderRef.current){otherSerialReaderRef.current.reset();otherSerialReaderRef.current=null;} };
  }, [showOtherSerialScanner]);

  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;
    let fieldValue;
    if (type === 'checkbox') {
      fieldValue = checked;
    } else if (type === 'number') {
      fieldValue = value === '' ? '' : parseFloat(value);
    } else {
      fieldValue = value;
    }
    const updated = {...formData, [name]: fieldValue};
    if(name==='brandId'){updated.modelId='';updated.modelNumberId='';setFilteredModelNumbers([]);}
    if(name==='modelId') updated.modelNumberId='';
    if(name==='deviceType'&&noProcessorTypes.includes(value)) updated.processorId='';
    setFormData(updated); setError('');
  };

  const handleOtherSerialChange=(e)=>{ const{name,value}=e.target; setCurrentOtherSerial(prev=>({...prev,[name]:value})); };
  const handleDeviceBarcodeScan=(v)=>{ setIsScanning(true); setFormData(prev=>({...prev,deviceBarcode:v})); setShowDeviceBarcodeScanner(false); showScanningMessage(`Scanned: ${v}`); setTimeout(()=>{if(v.trim())addDeviceBarcode();setIsScanning(false);},100); };
  const handleOtherSerialScan=(v)=>{ setIsScanning(true); setCurrentOtherSerial(prev=>({...prev,serialValue:v})); setShowOtherSerialScanner(false); showScanningMessage(`${currentOtherSerial.serialType} Scanned: ${v}`); setTimeout(()=>{if(v.trim())addOtherSerial();setIsScanning(false);},100); };

  const addFault=(id)=>{ if(!id)return; if(formData.selectedFaults.includes(parseInt(id))){setError('Fault already selected');return;} setFormData(prev=>({...prev,selectedFaults:[...prev.selectedFaults,parseInt(id)]})); setError(''); showSuccessMessage('Fault added!'); };
  const removeFault=(id)=>setFormData(prev=>({...prev,selectedFaults:prev.selectedFaults.filter(f=>f!==id)}));

  const addService = (id) => {
    if (!id) return;
    const svc = services.find(s => s.id === parseInt(id));
    if (!svc) return;
    if (formData.selectedServices.some(s => s.id === parseInt(id))) { setError('Service already selected'); return; }
    const effectivePrice = getServicePrice(svc, formData.isRegularCustomer);
    setFormData(prev => ({ ...prev, selectedServices: [...prev.selectedServices, { ...svc, effectivePrice }] }));
    setError('');
    showSuccessMessage('Service added!');
  };

  const removeService=(id)=>setFormData(prev=>({...prev,selectedServices:prev.selectedServices.filter(s=>s.id!==id)}));
  const calcTotal = () => formData.selectedServices.reduce((sum, s) => sum + (s.effectivePrice ?? s.servicePrice ?? 0), 0);

  const addDeviceCondition=(id)=>{ if(!id)return; if(formData.deviceConditionIds.includes(parseInt(id))){setError('Condition already selected');return;} setFormData(prev=>({...prev,deviceConditionIds:[...prev.deviceConditionIds,parseInt(id)]})); setError(''); showSuccessMessage('Condition added!'); };
  const removeDeviceCondition=(id)=>setFormData(prev=>({...prev,deviceConditionIds:prev.deviceConditionIds.filter(c=>c!==id)}));
  const addDeviceBarcode=async()=>{ const b=formData.deviceBarcode.trim(); if(!b){setError('Please enter or scan a device serial');return;} try{const r=await apiCall(`/api/jobcards/check-barcode/${encodeURIComponent(b)}`);if(r.exists){setError(`Barcode already exists: ${b}`);return;}}catch(e){console.error(e);} setFormData(prev=>({...prev,deviceBarcodes:[...prev.deviceBarcodes,b],deviceBarcode:''})); setError(''); showSuccessMessage('Serial added!'); };
  const removeDeviceBarcode=(i)=>setFormData(prev=>({...prev,deviceBarcodes:prev.deviceBarcodes.filter((_,idx)=>idx!==i)}));
  const addOtherSerial=()=>{ if(!currentOtherSerial.serialValue.trim()){setError('Please enter a serial value');return;} setFormData(prev=>({...prev,otherSerials:[...prev.otherSerials,{...currentOtherSerial}]})); setCurrentOtherSerial({serialType:serialTypes.filter(t=>!formData.otherSerials.some(s=>s.serialType===t))[0]||'IMEI',serialValue:''}); setError(''); showSuccessMessage('Serial added!'); };
  const removeOtherSerial=(i)=>setFormData(prev=>({...prev,otherSerials:prev.otherSerials.filter((_,idx)=>idx!==i)}));
  const getAvailableSerialTypes=()=>serialTypes.filter(t=>!formData.otherSerials.some(s=>s.serialType===t));

  const getUserIdFromToken=()=>{ try{const token=localStorage.getItem('token');if(token){const p=JSON.parse(atob(token.split('.')[1]));let uid=p.userId||p.id||p.sub;if(typeof uid==='string'){const n=parseInt(uid,10);return!isNaN(n)?n:1;}return uid||1;}}catch(e){console.error(e);}return 1; };
  const showSuccessMessage=(msg)=>{ document.querySelectorAll('.jc-msg').forEach(m=>m.remove()); const el=document.createElement('div'); el.className='jc-msg fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm'; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>{if(el.parentNode)el.remove();},2000); };
  const showScanningMessage=(msg)=>{ document.querySelectorAll('.jc-msg').forEach(m=>m.remove()); const el=document.createElement('div'); el.className='jc-msg fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm'; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>{if(el.parentNode)el.remove();},2000); };

  const handleSubmit=async(e)=>{ e.preventDefault(); setLoading(true); setError('');
    if(!formData.customerName.trim()){setError('Customer name is required');setLoading(false);return;}
    if(!formData.customerPhone.trim()){setError('Customer phone is required');setLoading(false);return;}
    if(formData.deviceBarcodes.length===0){setError('At least one device serial is required');setLoading(false);return;}
    try{
      const payload={
        isRegularCustomer:formData.isRegularCustomer,
        customer:formData.isRegularCustomer&&formData.customerId?{customerId:parseInt(formData.customerId)}:null,
        customerName:formData.customerName, customerPhone:formData.customerPhone, customerEmail:formData.customerEmail,
        deviceType:formData.deviceType,
        brand:formData.brandId?{id:parseInt(formData.brandId)}:null,
        model:formData.modelId?{id:parseInt(formData.modelId)}:null,
        modelNumber:formData.modelNumberId?{id:parseInt(formData.modelNumberId)}:null,
        processor:hasProcessor&&formData.processorId?{id:parseInt(formData.processorId)}:null,
        deviceConditions:formData.deviceConditionIds.map(id=>({id})),
        faults:formData.selectedFaults.map(id=>({id})),
        serviceCategories:formData.selectedServices.map(s=>({id:s.id})),
        faultDescription:formData.faultDescription, notes:formData.notes,
        advancePayment: formData.advancePayment === '' ? 0 : parseFloat(formData.advancePayment),
        estimatedCost: formData.estimatedCost === '' ? 0 : parseFloat(formData.estimatedCost),
        oneDayService:formData.oneDayService, withCharger:formData.withCharger,
        createdBy:getUserIdFromToken(),
        serials:[...formData.deviceBarcodes.map(b=>({serialType:'DEVICE_SERIAL',serialValue:b})),...formData.otherSerials]
      };
      const response=await apiCall('/api/jobcards',{method:'POST',body:JSON.stringify(payload)});
      showSuccessMessage(`Job Card ${response.jobNumber} created!`);
      if(onSuccess) onSuccess(response);
    }catch(err){console.error(err);setError(err.message||'Failed to create job card');}
    finally{setLoading(false);}
  };

  const inp="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500";
  const lbl="block text-xs font-medium text-gray-600 mb-0.5";
  const ttl="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-none bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <h2 className="text-sm font-bold text-gray-900">Create New Job Card</h2>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 max-w-xs truncate">{error}</span>}
          {onCancel && <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden" onKeyDown={(e)=>{if(e.key==='Enter'&&e.target.type!=='submit'&&e.target.type!=='textarea')e.preventDefault();}}>
        <div className="h-full grid grid-cols-4 gap-2 p-2 overflow-hidden">

          {/* COL 1: Customer + Device + Flags */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className={ttl}>Customer</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={formData.isRegularCustomer} onChange={handleRegularCustomerToggle} className="w-3 h-3 text-blue-600"/>
                  <span className="text-xs text-gray-600">Regular</span>
                </label>
              </div>

              {formData.isRegularCustomer ? (
                <div className="space-y-1">
                  {/* ✅ Searchable customer input with dropdown */}
                  <div className="relative">
                    <input
                      ref={customerSearchRef}
                      type="text"
                      value={customerSearchText}
                      onChange={(e) => {
                        setCustomerSearchText(e.target.value);
                        // Clear selected customer if user edits after selecting
                        if (formData.customerId) {
                          setFormData(prev => ({
                            ...prev,
                            customerId: '', customerName: '', customerPhone: '', customerEmail: ''
                          }));
                        }
                      }}
                      onFocus={() => { if (customerSearchText.trim()) setShowCustomerDropdown(true); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      placeholder="Search by name or phone..."
                      className="w-full px-2 py-1 border-2 border-blue-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      autoComplete="off"
                    />
                    {/* Search icon */}
                    <svg className="absolute right-2 top-1.5 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/>
                    </svg>

                    {/* ✅ Dropdown results */}
                    {showCustomerDropdown && (
                      <div
                        ref={customerDropdownRef}
                        className="absolute z-50 top-full left-0 right-0 mt-0.5 bg-white border border-blue-200 rounded shadow-lg max-h-40 overflow-y-auto"
                      >
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((c, i) => {
                            const cId = c.customerId || c.id;
                            return (
                              <div
                                key={`${cId}-${i}`}
                                onMouseDown={() => handleCustomerSearchSelect(c)}
                                className="px-2 py-1.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                              >
                                <div className="text-xs font-medium text-gray-800">{c.customerName}</div>
                                <div className="text-xs text-gray-500">{c.phoneNumber}</div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-2 py-2 text-xs text-gray-400 italic">No customers found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected customer info card */}
                  {formData.customerId && (
                    <div className="bg-gray-50 rounded p-1.5 text-xs space-y-0.5">
                      <div className="font-medium text-gray-800">{formData.customerName}</div>
                      <div className="text-gray-600">{formData.customerPhone}</div>
                      <div className="text-gray-500 truncate">{formData.customerEmail || 'No email'}</div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1">
                    <p className="text-xs text-blue-700 font-medium">⭐ Special pricing applied</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div><label className={lbl}>Name <span className="text-red-500">*</span></label><input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
                  <div><label className={lbl}>Phone <span className="text-red-500">*</span></label><input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inp} required onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
                  <div><label className={lbl}>Email</label><input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} placeholder="Optional" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/></div>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white flex-1">
              <div className={ttl}>Device Info</div>
              <div className="space-y-1">
                <div><label className={lbl}>Type <span className="text-red-500">*</span></label>
                  <select name="deviceType" value={formData.deviceType} onChange={handleChange} className={inp} required>
                    {deviceTypes.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Brand</label>
                  <select name="brandId" value={formData.brandId} onChange={handleChange} className={inp}>
                    <option value="">Select Brand</option>
                    {brands.map(b=><option key={b.id} value={b.id}>{b.brandName}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Model</label>
                  <select name="modelId" value={formData.modelId} onChange={handleChange} disabled={!formData.brandId} className={`${inp} ${!formData.brandId?'bg-gray-100 cursor-not-allowed':''}`}>
                    <option value="">{formData.brandId?'Select Model':'Select Brand first'}</option>
                    {filteredModels.map(m=><option key={m.id} value={m.id}>{m.modelName}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Model No.</label>
                  <select name="modelNumberId" value={formData.modelNumberId} onChange={handleChange} disabled={!formData.modelId} className={`${inp} ${!formData.modelId?'bg-gray-100 cursor-not-allowed':''}`}>
                    <option value="">{formData.modelId?'Select Model No.':'Select Model first'}</option>
                    {filteredModelNumbers.map(mn=><option key={mn.id} value={mn.id}>{mn.modelNumber}</option>)}
                  </select>
                </div>
                {hasProcessor ? (
                  <div><label className={lbl}>Processor</label>
                    <select name="processorId" value={formData.processorId} onChange={handleChange} className={inp}>
                      <option value="">Select Processor</option>
                      {processors.map(p=><option key={p.id} value={p.id}>{p.processorName}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                    <p className="text-xs text-amber-600 italic">⚠️ {formData.deviceType} has no processor</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className={ttl}>Flags</div>
              <div className="space-y-1.5">
                <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-colors ${formData.oneDayService?'bg-red-50 border-red-300':'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="checkbox" name="oneDayService" checked={formData.oneDayService} onChange={handleChange} className="w-3 h-3 text-red-600"/>
                  <span className="text-xs font-medium text-gray-800">🚨 One Day Service</span>
                </label>
                <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-colors ${formData.withCharger?'bg-green-50 border-green-300':'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="checkbox" name="withCharger" checked={formData.withCharger} onChange={handleChange} className="w-3 h-3 text-green-600"/>
                  <span className="text-xs font-medium text-gray-800">🔌 With Charger</span>
                </label>
              </div>
            </div>
          </div>

          {/* COL 2: Serials + Conditions */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-blue-200 rounded p-2 bg-blue-50">
              <div className="text-xs font-bold text-blue-700 mb-1.5 uppercase tracking-wide">Device Serial (PRIMARY) <span className="text-red-500">*</span></div>
              <div className="flex gap-1 mb-1">
                <input type="text" name="deviceBarcode" value={formData.deviceBarcode} onChange={handleChange}
                  onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();if(formData.deviceBarcode.trim())addDeviceBarcode();}}}
                  placeholder="Enter or scan serial"
                  className="flex-1 px-2 py-1 border-2 border-blue-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono bg-white" autoComplete="off"/>
                <button type="button" onClick={addDeviceBarcode} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium whitespace-nowrap">Add</button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {formData.deviceBarcodes.map((b,i)=>(
                  <div key={i} className="flex items-center justify-between bg-white p-1.5 rounded border border-blue-300">
                    <span className="text-xs font-mono text-gray-700 truncate flex-1">{b}</span>
                    <button type="button" onClick={()=>removeDeviceBarcode(i)} className="text-red-500 hover:text-red-700 ml-1 flex-shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                ))}
                {formData.deviceBarcodes.length===0&&<p className="text-xs text-blue-400 italic">No serials added yet</p>}
              </div>
            </div>

            <div className="border border-purple-200 rounded p-2 bg-purple-50">
              <div className="text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">Other Serials</div>
              <div className="mb-1">
                <select
                  name="serialType"
                  value={currentOtherSerial.serialType}
                  onChange={handleOtherSerialChange}
                  className="w-full px-1 py-1 border border-purple-300 rounded text-xs focus:outline-none bg-white mb-1"
                >
                  <option value="">Select Type</option>
                  {getAvailableSerialTypes().map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <div className="flex gap-1">
                  <input
                    type="text"
                    name="serialValue"
                    value={currentOtherSerial.serialValue}
                    onChange={handleOtherSerialChange}
                    onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();if(currentOtherSerial.serialValue.trim())addOtherSerial();}}}
                    placeholder="Serial value"
                    className="flex-1 px-2 py-1 border-2 border-purple-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono bg-white"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={addOtherSerial}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded font-medium whitespace-nowrap flex-shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {formData.otherSerials.map((s,i)=>(
                  <div key={i} className="flex items-center justify-between bg-white p-1.5 rounded border border-purple-300">
                    <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded mr-1.5 flex-shrink-0">{s.serialType}</span>
                    <span className="text-xs font-mono text-gray-700 truncate flex-1">{s.serialValue}</span>
                    <button type="button" onClick={()=>removeOtherSerial(i)} className="text-red-500 hover:text-red-700 ml-1 flex-shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                ))}
                {formData.otherSerials.length===0&&<p className="text-xs text-purple-400 italic">None added</p>}
              </div>
            </div>

            <div className="border border-yellow-200 rounded p-2 bg-yellow-50 flex-1">
              <div className="text-xs font-bold text-yellow-700 mb-1.5 uppercase tracking-wide">Device Conditions</div>
              <select onChange={(e)=>addDeviceCondition(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
                <option value="">-- Select condition --</option>
                {deviceConditions.map(c=><option key={c.id} value={c.id}>{c.conditionName}</option>)}
              </select>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-24 overflow-y-auto">
                {formData.deviceConditionIds.map(id=>{const c=deviceConditions.find(x=>x.id===id);return(
                  <span key={id} className="inline-flex items-center gap-0.5 bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs">
                    {c?.conditionName}<button type="button" onClick={()=>removeDeviceCondition(id)} className="text-yellow-600 hover:text-yellow-900 font-bold">✕</button>
                  </span>
                );})}
                {formData.deviceConditionIds.length===0&&<p className="text-xs text-yellow-500 italic">None selected</p>}
              </div>
            </div>
          </div>

          {/* COL 3: Faults + Services + Descriptions */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-red-200 rounded p-2 bg-red-50">
              <div className="text-xs font-bold text-red-700 mb-1.5 uppercase tracking-wide">Faults (Optional)</div>
              <select onChange={(e)=>addFault(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
                <option value="">-- Select fault --</option>
                {faults.map(f=><option key={f.id} value={f.id}>{f.faultName}</option>)}
              </select>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
                {formData.selectedFaults.map(id=>{const f=faults.find(x=>x.id===id);return(
                  <span key={id} className="inline-flex items-center gap-0.5 bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-xs">
                    {f?.faultName}<button type="button" onClick={()=>removeFault(id)} className="text-red-600 hover:text-red-900 font-bold">✕</button>
                  </span>
                );})}
                {formData.selectedFaults.length===0&&<p className="text-xs text-red-400 italic">None selected</p>}
              </div>
            </div>

            <div className="border border-green-200 rounded p-2 bg-green-50">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Services (Optional)</div>
                {formData.isRegularCustomer && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">⭐ Special Price</span>
                )}
              </div>
              <select onChange={(e)=>addService(e.target.value)} className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}>
                <option value="">-- Select service --</option>
                {services.map(s => {
                  const price = getServicePrice(s, formData.isRegularCustomer);
                  const isSpecial = formData.isRegularCustomer && s.specialServicePrice != null;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} - Rs.{price?.toFixed(2) || '0.00'}{isSpecial ? ' ⭐' : ''}
                    </option>
                  );
                })}
              </select>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
                {formData.selectedServices.map(s => (
                  <span key={s.id} className="inline-flex items-center gap-0.5 bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-xs">
                    {s.name} - Rs.{(s.effectivePrice ?? s.servicePrice)?.toFixed(2) || '0.00'}
                    <button type="button" onClick={() => removeService(s.id)} className="text-green-600 hover:text-green-900 font-bold">✕</button>
                  </span>
                ))}
                {formData.selectedServices.length===0&&<p className="text-xs text-green-500 italic">None selected</p>}
              </div>
              {formData.selectedServices.length>0&&(
                <div className="mt-1.5 flex justify-between items-center bg-green-100 border border-green-300 rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-700">Total:</span>
                  <span className="text-sm font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Fault Description</label>
              <textarea name="faultDescription" value={formData.faultDescription} onChange={handleChange} rows="3"
                placeholder="Detailed fault description (optional)..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"/>
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white flex-1">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Additional Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"
                placeholder="Any additional notes..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"/>
            </div>
          </div>

          {/* COL 4: Payment + Summary + Actions */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className={ttl}>Payment Info</div>
              <div className="space-y-1.5">
                <div><label className={lbl}>Advance Payment (Rs.)</label>
                  <input type="number" name="advancePayment" value={formData.advancePayment} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0.01" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
                </div>
                <div><label className={lbl}>Estimated Cost (Rs.)</label>
                  <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} onWheel={(e)=>e.target.blur()} min="0" step="0.01" className={inp} onKeyDown={(e)=>{if(e.key==='Enter')e.preventDefault();}}/>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded p-2 bg-gray-50 flex-1">
              <div className={ttl}>Summary</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-medium text-gray-800 truncate ml-1 max-w-24">{formData.customerName||'—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-medium text-gray-800">{formData.customerPhone||'—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Device:</span><span className="font-medium text-gray-800">{formData.deviceType}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Serials:</span><span className={`font-medium ${formData.deviceBarcodes.length>0?'text-green-600':'text-red-500'}`}>{formData.deviceBarcodes.length} added</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Faults:</span><span className="font-medium text-gray-800">{formData.selectedFaults.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Services:</span><span className="font-medium text-gray-800">{formData.selectedServices.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Conditions:</span><span className="font-medium text-gray-800">{formData.deviceConditionIds.length}</span></div>
                {formData.oneDayService&&<div className="bg-red-100 text-red-700 rounded px-1.5 py-0.5 text-center font-bold">🚨 ONE DAY SERVICE</div>}
                {formData.withCharger&&<div className="bg-green-100 text-green-700 rounded px-1.5 py-0.5 text-center font-bold">🔌 WITH CHARGER</div>}
                {formData.isRegularCustomer&&<div className="bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 text-center font-bold">⭐ REGULAR CUSTOMER</div>}
                {formData.selectedServices.length>0&&(
                  <div className="border-t border-gray-200 pt-1 flex justify-between">
                    <span className="text-gray-500">Service Total:</span>
                    <span className="font-bold text-green-700">Rs.{calcTotal().toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded p-2 bg-white">
              <div className={ttl}>Checklist</div>
              <div className="space-y-0.5 text-xs">
                {[{label:'Customer name',ok:!!formData.customerName.trim()},{label:'Phone number',ok:!!formData.customerPhone.trim()},{label:'Device serial',ok:formData.deviceBarcodes.length>0}].map((item,i)=>(
                  <div key={i} className="flex items-center gap-1.5">
                    <span className={item.ok?'text-green-500':'text-red-400'}>{item.ok?'✓':'○'}</span>
                    <span className={item.ok?'text-gray-700':'text-gray-400'}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded transition-colors">
                {loading?'Creating...':'✓ Create Job Card'}
              </button>
              {onCancel&&<button type="button" onClick={onCancel} className="w-full py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors">Cancel</button>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobCardCreate;