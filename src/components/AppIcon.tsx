import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { colors } from '../theme/colors';

export type IconComponent = FC<SvgProps>;

type Props = {
  icon: IconComponent;
  size?: number;
  color?: string;
};

export function AppIcon({
  icon: Icon,
  size = 22,
  color = colors.inputIcon,
}: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Icon
        width={size}
        height={size}
        fill={color}
        color={color}
        stroke={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
