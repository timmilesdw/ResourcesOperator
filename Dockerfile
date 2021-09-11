FROM node:14-alpine

ARG USER=resourceoperator
ENV HOME /home/$USER

RUN addgroup -g 1001 -S $USER \
    && adduser -S --ingroup $USER --uid 1001 $USER

WORKDIR $HOME/app

COPY --chown=$USER . .

RUN npm i && npm run build

USER $USER

CMD ["node", "/home/resourceoperator/app/build/index.js"]