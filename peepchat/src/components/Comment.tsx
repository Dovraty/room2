import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { radius, space, useTheme } from '@/theme';
import { getAudience, type Comment as C } from '@/data';
import { compact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { AudienceAvatar } from './Avatar';
import { Text } from './Text';
import { Icon } from './Icon';
import { Tap } from './Tap';

/** A gallery comment. Quieter than the stage: cool palette, smaller type, no bubbles. */
export function CommentItem({ comment, depth = 0, onReply }: { comment: C; depth?: number; onReply?: (c: C) => void }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(depth === 0 && !!comment.pinned);
  const a = getAudience(comment.by);
  const replies = comment.replies ?? [];
  return (
    <Animated.View layout={reduce ? undefined : LinearTransition.springify().damping(24)} style={{ paddingLeft: depth ? 38 : 0 }}>
      <View style={{ flexDirection: 'row', gap: space.md, paddingVertical: space.sm }}>
        <AudienceAvatar id={comment.by} size={depth ? 24 : 30} />
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="caption" color={c.galleryText}>@{a.handle}</Text>
            <Text variant="caption" color={c.galleryTextSecondary} style={{ fontFamily: 'Inter_400Regular' }}>{comment.ago}</Text>
            {comment.pinned && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Icon name="pin" size={11} color={c.galleryAccent} />
                <Text variant="caption" color={c.galleryAccent}>Top</Text>
              </View>
            )}
          </View>
          <Text variant="callout" color={c.galleryText} style={{ fontFamily: 'Inter_400Regular' }}>{comment.text}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, marginTop: 2 }}>
            <Tap minHit={false} hitSlop={12} onPress={() => onReply?.(comment)} accessibilityLabel={`Reply to ${a.handle}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 28 }}>
              <Icon name="reply" size={14} color={c.galleryTextSecondary} />
              <Text variant="caption" color={c.galleryTextSecondary}>Reply</Text>
            </Tap>
            {depth === 0 && replies.length > 0 && (
              <Tap minHit={false} hitSlop={12} onPress={() => setOpen((o) => !o)} accessibilityLabel={open ? 'Hide replies' : `Show ${replies.length} replies`} accessibilityState={{ expanded: open }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 28 }}>
                <View style={{ width: 16, height: 1.5, backgroundColor: c.galleryLine }} />
                <Text variant="caption" color={c.galleryAccent}>{open ? 'Hide thread' : `${replies.length} replies`}</Text>
              </Tap>
            )}
          </View>
        </View>
        <Tap
          minHit
          onPress={() => { haptic('react'); setLiked((l) => !l); }}
          accessibilityLabel={liked ? 'Unlike comment' : 'Like comment'}
          accessibilityState={{ selected: liked }}
          style={{ alignItems: 'center', gap: 1, paddingTop: 4 }}
        >
          <Icon name="heart" size={16} color={liked ? c.live : c.galleryTextSecondary} />
          <Text variant="caption" color={c.galleryTextSecondary} tabular>{compact(comment.likes + (liked ? 1 : 0))}</Text>
        </Tap>
      </View>
      {open && replies.map((r) => (
        <Animated.View key={r.id} entering={reduce ? undefined : FadeInDown.duration(220)} style={{ borderLeftWidth: 1.5, borderLeftColor: c.galleryLine, marginLeft: 14 }}>
          <CommentItem comment={r} depth={1} onReply={onReply} />
        </Animated.View>
      ))}
    </Animated.View>
  );
}

export function SideRoomCard({ name, about, members, last, hot }: { name: string; about: string; members: number; last: string; hot?: boolean }) {
  const { c } = useTheme();
  return (
    <Tap scaleTo={0.98} accessibilityLabel={`Side discussion ${name}, ${members} people. ${about}`} style={{ backgroundColor: c.galleryRaised, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: c.galleryLine, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name="hash" size={14} color={c.galleryAccent} />
        <Text variant="headline" color={c.galleryText} style={{ flex: 1 }}>{name}</Text>
        {hot && <Icon name="flame" size={14} color={c.spotlightInk} />}
        <Text variant="caption" color={c.galleryTextSecondary}>{compact(members)} in here</Text>
      </View>
      <Text variant="footnote" color={c.galleryTextSecondary}>{about}</Text>
      <Text variant="footnote" color={c.galleryText} numberOfLines={1} style={{ opacity: 0.85 }}>{last}</Text>
    </Tap>
  );
}
