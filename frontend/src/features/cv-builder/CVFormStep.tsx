import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Label, TextInput, Textarea } from 'flowbite-react';
import type { CVStepProps } from './CVWizard';

interface CVFormStepProps extends CVStepProps {}

export default function CVFormStep({ cvData, updateCVData }: CVFormStepProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills'>('personal');

  const updatePersonalInfo = (field: string, value: string) => {
    updateCVData({
      personalInfo: { ...cvData.personalInfo, [field]: value }
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('builder.form.personalInfo')}
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(['personal', 'experience', 'education', 'skills'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t(`builder.form.${tab === 'personal' ? 'personalInfo' : tab}`)}
          </button>
        ))}
      </div>

      {/* Form sections */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" value={t('builder.form.labels.firstName')} />
              <TextInput
                id="firstName"
                value={cvData.personalInfo.firstName || ''}
                onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                placeholder={t('builder.form.placeholders.firstName')}
              />
            </div>
            <div>
              <Label htmlFor="lastName" value={t('builder.form.labels.lastName')} />
              <TextInput
                id="lastName"
                value={cvData.personalInfo.lastName || ''}
                onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                placeholder={t('builder.form.placeholders.lastName')}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email" value={t('builder.form.labels.email')} />
            <TextInput
              id="email"
              type="email"
              value={cvData.personalInfo.email || ''}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder={t('builder.form.placeholders.email')}
            />
          </div>
          <div>
            <Label htmlFor="phone" value={t('builder.form.labels.phone')} />
            <TextInput
              id="phone"
              value={cvData.personalInfo.phone || ''}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              placeholder={t('builder.form.placeholders.phone')}
            />
          </div>
          <div>
            <Label htmlFor="summary" value={t('builder.form.labels.summary')} />
            <Textarea
              id="summary"
              rows={4}
              value={cvData.personalInfo.summary || ''}
              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
              placeholder={t('builder.form.placeholders.summary')}
            />
          </div>
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('builder.form.experience')} - Coming soon
          </p>
        </div>
      )}

      {activeTab === 'education' && (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('builder.form.education')} - Coming soon
          </p>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('builder.form.skills')} - Coming soon
          </p>
        </div>
      )}
    </div>
  );
}
