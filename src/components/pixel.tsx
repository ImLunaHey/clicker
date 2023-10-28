import dedent from 'dedent';

export const Pixel: React.FC = () => (
  <div
    dangerouslySetInnerHTML={{
      __html: dedent`
          <img
              style="display: 'none';"
              src="https://v.fish.lgbt/pixel.gif?id=clicker.fish.lgbt"
              onError="this.onerror=null;this.src='https://v.fish.lgbt/completely-innocent-looking-gif-nothing-to-see-here.gif?id=clicker.fish.lgbt';"
          />
        `,
    }}
  ></div>
);
