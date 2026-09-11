import {
  AlertType,
  AlertStructuredData,
} from "@/Bible/components/AlertTemplates/alertTemplateTypes";

export interface AlertModalProps {
  visible: boolean;
  initialText?: string;
  initialColor?: string;
  initialThemeName?: string;
  initialTemplateId?: string;
  initialAlertType?: AlertType | string;
  initialStructuredData?: AlertStructuredData;
  editingAlertId?: string | null;
  onCancel: () => void;
  onSave: (payload: {
    text: string;
    backgroundColor?: string;
    themeName?: string;
    templateId?: string;
    isAiGenerated?: boolean;
    id?: string;
    alertType?: AlertType;
    structuredData?: AlertStructuredData;
  }) => void;
}

export type ColorRange = {
  start: number;
  end: number;
  color: string;
};

export type TextSnapshot = {
  text: string;
  ranges: ColorRange[];
  structuredData: AlertStructuredData;
  alertType: AlertType;
};
