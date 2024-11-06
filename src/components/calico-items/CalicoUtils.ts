export function flattenDate(data: any[]) {
  return Array.from(
    new Set([
      ...data.reduce(function (a, b) {
        return a.concat(b);
      }, []),
      ...data.reduce(function (a, b) {
        return b.children ? a.concat(b.children) : a;
      }, []),
      ...data.reduce(function (a, b) {
        if (b.children) {
          b.children.map((t: any) => {
            if (t.children) {
              a = [...a.concat(t.children)];
            }
            return t;
          });
        }
        return a;
      }, []),
    ])
  );
}
