import { memo } from 'react';
import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

interface HighlightTextProps extends Omit<TextProps, 'style'> {
  text: string;
  query: string;
  style?: StyleProp<TextStyle>;
  highlightStyle?: StyleProp<TextStyle>;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightTextBase({ text, query, style, highlightStyle, ...rest }: HighlightTextProps) {
  const trimmed = query.trim();

  if (!trimmed || !text) {
    return (
      <Text style={style} {...rest}>
        {text}
      </Text>
    );
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, 'gi'));

  return (
    <Text style={style} {...rest}>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <Text key={index} style={[style, highlightStyle]}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

export const HighlightText = memo(HighlightTextBase);
