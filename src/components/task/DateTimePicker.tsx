import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';
import { Button } from '@/src/components/ui/Button';
import { getDateForPreset, formatRelativeDate } from '@/src/utils/dates';
import type { RecurrenceType, RecurrenceRule } from '@/src/types';

interface DateTimePickerProps {
  dueDate?: string;
  dueTime?: string;
  recurrence: RecurrenceRule;
  onDateChange: (date: string | undefined) => void;
  onTimeChange: (time: string | undefined) => void;
  onRecurrenceChange: (recurrence: RecurrenceRule) => void;
}

const datePresets = [
  { label: 'Today', value: 'today', icon: 'today-outline' as const },
  { label: 'Tomorrow', value: 'tomorrow', icon: 'sunny-outline' as const },
  { label: 'Next Week', value: 'nextWeek', icon: 'calendar-outline' as const },
  { label: 'No Date', value: 'none', icon: 'close-circle-outline' as const },
];

const recurrenceOptions: { label: string; value: RecurrenceType }[] = [
  { label: 'None', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export function DateTimePicker({
  dueDate,
  dueTime,
  recurrence,
  onDateChange,
  onTimeChange,
  onRecurrenceChange,
}: DateTimePickerProps) {
  const { colors, typography: t, spacing: sp, borderRadius: br } = useTheme();
  const haptics = useHaptics();

  const [is24Hour, setIs24Hour] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse current time or default to 12:00 PM
  const currentHours24 = dueTime ? parseInt(dueTime.split(':')[0]) : 12;
  const currentMins = dueTime ? dueTime.split(':')[1] : '00';
  
  const displayHours = is24Hour 
    ? currentHours24 
    : (currentHours24 === 0 ? 12 : currentHours24 > 12 ? currentHours24 - 12 : currentHours24);
  const isPM = currentHours24 >= 12;

  // Local state for smooth typing
  const [hInput, setHInput] = useState(displayHours.toString());
  const [mInput, setMInput] = useState(currentMins);

  const validateTime = (h: string, m: string) => {
    const hNum = parseInt(h);
    const mNum = parseInt(m);
    
    if (isNaN(hNum) || isNaN(mNum)) return null;
    
    if (is24Hour) {
      if (hNum < 0 || hNum > 23) return 'Hour must be 0-23';
    } else {
      if (hNum < 1 || hNum > 12) return 'Hour must be 1-12';
    }
    
    if (mNum < 0 || mNum > 59) return 'Min must be 0-59';
    
    return null;
  };

  const updateTime = (h: string, m: string, pm: boolean, is24: boolean) => {
    const sanitizedH = h.replace(/[^0-9]/g, '').slice(0, 2);
    const sanitizedM = m.replace(/[^0-9]/g, '').slice(0, 2);
    
    setHInput(sanitizedH);
    setMInput(sanitizedM);

    const err = validateTime(sanitizedH, sanitizedM);
    setError(err);

    if (!err) {
      let hNum = parseInt(sanitizedH);
      const mNum = parseInt(sanitizedM);
      
      // If user is typing a 12-hour-like number, apply AM/PM logic
      // This makes the AM/PM buttons useful even in 24h mode
      if (hNum <= 12) {
        if (pm && hNum < 12) hNum += 12;
        if (!pm && hNum === 12) hNum = 0;
      }
      
      onTimeChange(`${hNum.toString().padStart(2, '0')}:${mNum.toString().padStart(2, '0')}`);
    }
  };

  const toggleAmPm = (pm: boolean) => {
    haptics.selection();
    const hNum = parseInt(hInput) || 12;
    const mNum = parseInt(mInput) || 0;
    
    let finalH = hNum;
    if (pm && hNum < 12) finalH += 12;
    if (!pm && hNum === 12) finalH = 0;
    
    onTimeChange(`${finalH.toString().padStart(2, '0')}:${mNum.toString().padStart(2, '0')}`);
    // Update local display immediately
    setHInput(is24Hour ? finalH.toString() : (finalH === 0 ? '12' : finalH > 12 ? (finalH - 12).toString() : finalH.toString()));
  };

  // Sync local input state with prop changes (e.g., from toggle or parent)
  React.useEffect(() => {
    if (dueTime) {
      const [h, m] = dueTime.split(':');
      const hNum = parseInt(h);
      const displayH = is24Hour ? hNum : (hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum);
      setHInput(displayH.toString());
      setMInput(m);
    }
  }, [dueTime, is24Hour]);

  return (
    <View style={styles.container}>
      {/* Selected Date Display */}
      <View style={styles.dateHeader}>
        <Text style={[t.labelMedium, { color: colors.textSecondary }]}>
          Due Date
        </Text>
        {dueDate && (
          <Text style={[t.bodySmall, { color: colors.primary, fontWeight: '600' }]}>
            {new Date(dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
        )}
      </View>
      <View style={styles.presetsRow}>
        {datePresets.map((preset) => {
          let isSelected = false;
          if (preset.value === 'none') {
            isSelected = !dueDate;
          } else if (dueDate) {
            const presetDate = getDateForPreset(preset.value);
            isSelected = new Date(dueDate).toDateString() === new Date(presetDate).toDateString();
          }

          return (
            <Pressable
              key={preset.value}
              onPress={() => {
                haptics.selection();
                if (preset.value === 'none') {
                  onDateChange(undefined);
                } else {
                  onDateChange(getDateForPreset(preset.value));
                }
              }}
              style={[
                styles.presetChip,
                {
                  backgroundColor: isSelected
                    ? `${colors.primary}15`
                    : colors.backgroundSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: br.lg,
                },
              ]}
            >
              <Ionicons
                name={preset.icon}
                size={16}
                color={isSelected ? colors.primary : colors.textTertiary}
              />
              <Text
                style={[
                  t.labelSmall,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                    marginLeft: 6,
                  },
                ]}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Time Selection */}
      {dueDate && (
        <View style={{ marginTop: sp.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sp.sm, paddingHorizontal: sp.xs }}>
            <Text style={[t.labelMedium, { color: colors.textSecondary }]}>
              Time Reminder
            </Text>
            <Pressable 
              onPress={() => {
                haptics.selection();
                const next24 = !is24Hour;
                setIs24Hour(next24);
                // Convert current display to new format
                const hNum = parseInt(hInput) || 0;
                if (next24) {
                  // 12h -> 24h
                  let newH = hNum;
                  if (isPM && hNum < 12) newH += 12;
                  if (!isPM && hNum === 12) newH = 0;
                  setHInput(newH.toString());
                } else {
                  // 24h -> 12h
                  let newH = hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum;
                  setHInput(newH.toString());
                }
                setError(null);
              }}
              style={styles.formatToggle}
            >
              <Text style={[t.labelSmall, { color: colors.primary }]}>{is24Hour ? '24H' : '12H'}</Text>
            </Pressable>
          </View>

          <View style={[
            styles.timeRow, 
            { backgroundColor: colors.backgroundSecondary, borderRadius: br.lg },
            error ? { borderColor: colors.danger, borderWidth: 1 } : null
          ]}>
            <TextInput
              style={[t.titleLarge, styles.timeInput, { color: colors.text }]}
              value={hInput}
              onChangeText={(val) => updateTime(val, mInput, isPM, is24Hour)}
              onBlur={() => {
                const val = parseInt(hInput);
                if (isNaN(val)) {
                  setHInput(is24Hour ? '12' : '12');
                } else {
                  if (is24Hour) {
                    if (val > 23) setHInput('23');
                    else if (val < 0) setHInput('0');
                  } else {
                    if (val > 12) setHInput('12');
                    else if (val < 1) setHInput('12');
                  }
                }
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={2}
              placeholder={is24Hour ? "23" : "12"}
              placeholderTextColor={colors.textTertiary}
              selectTextOnFocus
            />
            <Text style={[t.titleLarge, { color: colors.textTertiary, marginHorizontal: 8 }]}>:</Text>
            <TextInput
              style={[t.titleLarge, styles.timeInput, { color: colors.text }]}
              value={mInput}
              onChangeText={(val) => updateTime(hInput, val, isPM, is24Hour)}
              onBlur={() => {
                const val = parseInt(mInput);
                if (isNaN(val)) setMInput('00');
                else if (val > 59) setMInput('59');
                else setMInput(val.toString().padStart(2, '0'));
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="00"
              placeholderTextColor={colors.textTertiary}
              selectTextOnFocus
            />
            
            <View style={styles.amPmContainer}>
              <Pressable 
                onPress={() => toggleAmPm(false)}
                style={[styles.amPmBtn, !isPM && { backgroundColor: colors.primary }]}
              >
                <Text style={[t.labelSmall, { color: !isPM ? '#FFF' : colors.textTertiary, fontWeight: '700' }]}>AM</Text>
              </Pressable>
              <Pressable 
                onPress={() => toggleAmPm(true)}
                style={[styles.amPmBtn, isPM && { backgroundColor: colors.primary }]}
              >
                <Text style={[t.labelSmall, { color: isPM ? '#FFF' : colors.textTertiary, fontWeight: '700' }]}>PM</Text>
              </Pressable>
            </View>
          </View>

          {error && (
            <Text style={[t.caption, { color: colors.danger, marginTop: 4, marginLeft: sp.xs }]}>
              {error}
            </Text>
          )}

          <Text style={[t.caption, { color: colors.textTertiary, marginTop: error ? 4 : 8, marginLeft: sp.xs }]}>
            We'll notify you 10 minutes before and at this time.
          </Text>
        </View>
      )}


      {/* Recurrence */}
      <Text
        style={[
          t.labelMedium,
          { color: colors.textSecondary, marginTop: sp.lg, marginBottom: sp.sm, marginLeft: sp.xs },
        ]}
      >
        Repeat
      </Text>
      <View style={styles.presetsRow}>
        {recurrenceOptions.map((opt) => {
          const isSelected = recurrence.type === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                haptics.selection();
                onRecurrenceChange({ type: opt.value, interval: 1 });
              }}
              style={[
                styles.presetChip,
                {
                  backgroundColor: isSelected
                    ? `${colors.primary}15`
                    : colors.backgroundSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: br.lg,
                },
              ]}
            >
              <Text
                style={[
                  t.labelSmall,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  timeInput: {
    width: 50,
    textAlign: 'center',
    padding: 4,
  },
  amPmContainer: {
    flexDirection: 'row',
    marginLeft: 16,
    gap: 4,
  },
  amPmBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  formatToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
});





