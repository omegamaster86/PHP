import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, List, ListItem, ListItemIcon, ListItemText, styled } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { MyPageSideBarListItem } from '.';

const NormalListItem = styled(ListItem)({
  position: 'relative',
  fontSize: '14px',
});

const StyledChildItem = styled(ListItem)({
  position: 'relative',
  width: '178px',
  marginLeft: '28px',
  paddingLeft: '20px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '16px',
    height: '100%',
    borderLeft: '2px solid #F6F6F6',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '20px',
    left: 0,
    width: '16px',
    height: '2px',
    backgroundColor: '#F6F6F6',
  },
});

const StyledChildLastItem = styled(ListItem)({
  position: 'relative',
  width: '178px',
  marginLeft: '28px',
  paddingLeft: '20px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '16px',
    height: '20px',
    borderLeft: '2px solid #F6F6F6',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '20px',
    left: 0,
    width: '16px',
    height: '2px',
    backgroundColor: '#F6F6F6',
  },
});

type Props = {
  item: MyPageSideBarListItem;
  withTreeLine?: boolean;
};

const NestedItem: React.FC<Props> = (props) => {
  const { item, withTreeLine } = props;
  const { link, title, icon, items, active } = item;

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const hasItems = !!items?.length;

  const onClick = () => {
    // 子アイテムがある場合は開閉
    if (hasItems) {
      handleOpen();
    } else {
      item.action?.();
    }
  };

  const BlankOrLink: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (hasItems) {
      return <>{children}</>;
    }
    return <Link href={link ?? ''}>{children}</Link>;
  };

  return (
    <List>
      <BlankOrLink>
        <ListItem
          component={hasItems || link ? 'button' : 'a'}
          onClick={onClick}
          sx={{
            bgcolor: active ? '#F6F6F6' : 'inherit',
            '&:hover': {
              bgcolor: '#F6F6F6',
            },
            borderRadius: '8px',
          }}
        >
          {icon && <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>}
          <ListItemText primary={title} />
          {hasItems && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>

        {hasItems && (
          <Collapse in={open}>
            <List>
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const ChildListItem = (() => {
                  if (!withTreeLine) {
                    return NormalListItem;
                  }

                  if (isLast) {
                    return StyledChildLastItem;
                  }
                  return StyledChildItem;
                })();

                return (
                  <Link key={item.title} href={item.link ?? ''} onClick={item.action}>
                    <ChildListItem sx={{ padding: 0 }}>
                      <ListItemText
                        primary={item.title}
                        sx={{
                          paddingLeft: '10px',
                          paddingRight: '20px',
                          paddingY: '8px',
                          marginX: '20px',
                          borderRadius: '8px',
                          bgcolor: item.active ? '#F6F6F6' : 'inherit',
                          '&:hover': {
                            bgcolor: '#F6F6F6',
                          },
                        }}
                      />
                    </ChildListItem>
                  </Link>
                );
              })}
            </List>
          </Collapse>
        )}
      </BlankOrLink>
    </List>
  );
};

export default NestedItem;
