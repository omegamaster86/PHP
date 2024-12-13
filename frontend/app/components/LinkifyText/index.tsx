import Validator from '@/app/utils/validator';

type Props = {
  children: string;
};

const LinkifyText: React.FC<Props> = (props) => {
  const { children } = props;
  const text = children;

  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

  const parseTextToElements = (input: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    input.replace(linkRegex, (fullMatch, title, url, offset) => {
      // 通常のテキスト部分を追加
      if (lastIndex < offset) {
        result.push(input.slice(lastIndex, offset));
      }

      if (Validator.isValidUrl(url)) {
        // リンク部分を追加
        result.push(
          <a
            key={offset}
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary-400 hover:underline'
          >
            {title}
          </a>,
        );
      } else {
        // URLが不正な場合はテキストとして追加
        result.push(title);
      }

      lastIndex = offset + fullMatch.length;
      return fullMatch;
    });

    // 残りの通常テキスト部分を追加
    if (lastIndex < input.length) {
      result.push(input.slice(lastIndex));
    }

    return result;
  };

  return parseTextToElements(text);
};

export default LinkifyText;
