import type React from "react";

export interface UploadZoneProps {
  label: string;
  file: File | null;
  onClear: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
}

export interface Project {
  id: string;
  name?: string;
  userId?: User;
}
