import React from 'react';
import { Badge, OverlayTrigger, Popover } from 'react-bootstrap';

function BadgePopover({ label, count, children, variant = 'primary', ...props }) {
  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="top"
      overlay={
        <Popover id="badge-popover" style={{ minWidth: 220 }}>
          <Popover.Body>{children}</Popover.Body>
        </Popover>
      }
    >
      <Badge bg={variant} style={{ cursor: 'pointer', fontSize: '1rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: 20 }} {...props}>
        {label} {count !== undefined ? `(${count})` : ''}
      </Badge>
    </OverlayTrigger>
  );
}

export default BadgePopover;
