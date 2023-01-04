import { useEffect, useState } from 'preact/hooks';

export const useQueryParams = (): [Record<string, string>, boolean] => {
  const [params, setParams] = useState<Record<string,string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (location.search) {
      const search = location.search.replace(/^\?/, '');
      const params: Record<string, string> = {};
      for (const query of search.split('&')) {
        const [key, value] = query.split('=');
        params[key] = value;
      }
      setParams(params);
    }
    setReady(true);
  }, [])

  return [params, ready];
}