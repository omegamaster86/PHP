import MenuButton from '@/app/components/MenuButton';
import { Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MyPageSideBarListItem } from '../MyPageSideBar';

type Props = {
  listItems: MyPageSideBarListItem[];
};

const MyPageScrollBar: React.FC<Props> = (props) => {
  const { listItems } = props;

  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const childItems = listItems[currentIndex].items ?? [];

  return (
    <div className='flex flex-row justify-center overflow-x-scroll gap-4 px-2 text-sm text-secondaryText border-solid border-b-[1px]'>
      {listItems.map((x, index) => (
        <MenuButton
          key={x.title}
          className='whitespace-nowrap'
          id='basic-button'
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          active={x.active}
          onClick={(e) => {
            setCurrentIndex(index);

            if (x.link) {
              router.push(x.link);
              return;
            }
            if (!!x.items?.length) {
              handleClick(e);
              return;
            }
          }}
        >
          {x.title}
        </MenuButton>
      ))}

      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {childItems.map((x) => (
          <MenuItem
            key={x.title}
            onClick={() => {
              if (x.link) {
                router.push(x.link);
              }
              handleClose();
            }}
          >
            {x.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default MyPageScrollBar;
