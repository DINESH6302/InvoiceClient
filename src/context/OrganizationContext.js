'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const OrganizationContext = createContext();

export function OrganizationProvider({ children }) {
  const [organizations, setOrganizations] = useState([
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'Globex Inc' }
  ]);
  const [currentOrgId, setCurrentOrgId] = useState('1');

  const currentOrg = organizations.find(o => o.id === currentOrgId) || organizations[0];

  const addOrganization = (name) => {
    const newOrg = { id: Date.now().toString(), name };
    setOrganizations([...organizations, newOrg]);
    setCurrentOrgId(newOrg.id);
  };

  const switchOrganization = (orgId) => {
    setCurrentOrgId(orgId);
  };

  return (
    <OrganizationContext.Provider value={{ 
      organizations, 
      currentOrg, 
      currentOrgId, 
      addOrganization, 
      switchOrganization 
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  return useContext(OrganizationContext);
}
